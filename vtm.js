var exec = require("child_process").execSync;
var fs = require("fs");
var crypto = require("crypto");
var os = require("os");
var Discord = require("discord.js");
var config = require("./config");

var webhook = new Discord.WebhookClient(config.webhook.id, config.webhook.token);

async function capture() {
	if (process.platform == "darwin" && config.capture_console_only && exec("stat -f '%Su' /dev/console").toString().trim() != os.userInfo().username) throw "Not console";
	if (process.platform == "win32") {
		try { //TODO doesn't work on home versions of windows?
			exec("query user", {windowsHide: true}); // fsr this exits with code 1 which node considers an error
		} catch(cp) {
			let x = cp.stdout.toString().split('\n').find(x => x.startsWith('>'));
			if (x && x.substr(46, 4) == "Disc") throw "Inactive session"; // will capture black screen otherwise
		}
		try {
			let output = String(exec("powershell ./GetNetworkCostType.ps1", {windowsHide: true})).trim();
			if (output == "Fixed") throw "On metered network";
			else if (output != "Unrestricted") {
				console.warn("Unknown output from powershell script:", output);
			}
		} catch(e) { console.error(error.message); }
	}
	var filedate = new Date();
	var filename = `${filedate.toISOString().replace(/:/g, '-')}_${encodeURIComponent(crypto.randomBytes(16).toString('base64'))}.jpg`
	var filepath = os.tmpdir() + '/' + filename;
	if (process.platform == "darwin") {
		exec(`screencapture -x -C -t jpg "${filepath}"`);
	} else if (process.platform == "win32") {
		exec(`"${__dirname}/screenCapture.exe" "${filepath}"`, {windowsHide: true});
	} else {
		exec(`import -silent -window root "${filepath}"`);
	}
	var data = fs.readFileSync(filepath);
	try {
		await webhook.send(`y${filedate.getFullYear()} mo${filedate.getMonth()} d${filedate.getDate()} h${filedate.getHours()} mi${filedate.getMinutes()} s${filedate.getSeconds()}`, {files:[{
			attachment: data,
			name: filename
		}]});
	} finally {
		fs.unlinkSync(filepath);
	}
}

(function loop(){
	capture().finally(()=>{
		setTimeout(loop, config.interval);
	}).catch(rejection => {
		if (process.env.DEBUG) console.error(rejection);
	});
})();

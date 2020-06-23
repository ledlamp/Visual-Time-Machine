var exec = require("child_process").execFileSync;
var fs = require("fs");
var crypto = require("crypto");
var os = require("os");
var Discord = require("discord.js");
var config = require("./config");

var webhook = new Discord.WebhookClient(config.webhook.id, config.webhook.token);

var lastdata;
async function capture() {
	if (process.platform == "darwin" && config.capture_console_only && exec("stat",  ["-f", "%Su", "/dev/console"]).toString().trim() != os.userInfo().username) throw "Not console";
	if (process.platform == "win32") {
		if (config.disable_on_inactive_session) {
			try {
				exec("query", ["user"], {windowsHide: true}); // fsr this exits with code 1 which node considers an error
			} catch(cp) {
				let x = cp.stdout.toString().split('\n').find(x => x.startsWith('>'));
				if (x && x.substr(46, 4) == "Disc") throw "Inactive session";
			}
		}
		if (config.disable_on_metered_networks) {
			let output;
			try {
				output = String(exec("powershell.exe", ["./GetNetworkCostType.ps1"], {windowsHide: true})).trim();
			} catch(e) { console.error("powershell error:", e.message); }
			if (output)
			if (output == "Fixed") throw "On metered network";
			else if (output == "Null") throw "No network";
			else if (output != "Unrestricted") {
				console.warn("Unknown output from powershell script:", output);
			}
		}
	}
	var filedate = new Date();
	var filename = `${filedate.toISOString().replace(/:/g, '-')}_${encodeURIComponent(crypto.randomBytes(16).toString('base64'))}.jpg`
	var filepath = os.tmpdir() + '/' + filename;
	if (process.platform == "darwin") {
		exec("screencapture", ["-x", "-C", "-t", "jpg", filepath]);
	} else if (process.platform == "win32") {
		exec(`${__dirname}/screenCapture.exe`, [filepath], {windowsHide: true});
	} else {
		exec("import", ["-silent", "-window", "root", filepath]);
	}
	var data = fs.readFileSync(filepath);
	if (lastdata && data.equals(lastdata)) throw "Identical screenshot";
	else lastdata = data;
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

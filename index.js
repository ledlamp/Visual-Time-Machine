var exec = require("child_process").execSync;
var fs = require("fs");
var crypto = require("crypto");
var os = require("os");
var Discord = require("discord.js");

var config = require("./config");
var whoiam = exec("id -un").toString().trim();

var webhook = new Discord.WebhookClient(config.webhook.id, config.webhook.token);

async function capture() {
	if (config.capture_console_only && exec("stat -f '%Su' /dev/console").toString().trim() != whoiam) throw "Not console";
	var filename = `${new Date().toISOString()} ${encodeURIComponent(crypto.randomBytes(16).toString('base64'))}.jpg`
	var filepath = os.tmpdir() + '/' + filename;
	exec(`screencapture -x -C -t jpg "${filepath}"`);
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
	}).catch(()=>{});
})();

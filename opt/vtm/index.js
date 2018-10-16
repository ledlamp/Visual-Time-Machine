var exec = require("child_process").execSync;
var fs = require("fs");
var crypto = require("crypto");
var os = require("os");
var Discord = require("discord.js");

var config = require("./config");
var whoiam = exec("id -un").toString().trim();

var webhook = new Discord.WebhookClient(config.webhook.id, config.webhook.token);

function capture() {
	return new Promise(function(resolve, reject){
		if (config.capture_console_only) {
			if (exec("stat -f '%Su' /dev/console").toString().trim() != whoiam) return reject("Not console");
		}
		var filename = `${new Date().toISOString()} ${encodeURIComponent(crypto.randomBytes(16).toString('base64'))}.jpg`
		var path = os.tmpdir() + '/' + filename;
		exec(`screencapture -x -C -t jpg "${path}"`);
		var data = fs.readFileSync(path);
		webhook.send({files:[{
			attachment: data,
			name: filename
		}]}).finally(()=>{
			fs.unlink(path, ()=>{});
			resolve();
		});
	});
}

(function loop(){
	capture().finally(()=>{
		setTimeout(loop, config.interval);
	}).catch(()=>{});
})();

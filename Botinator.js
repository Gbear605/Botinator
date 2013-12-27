API.on(API.CHAT, newChat);
API.chatLog("Botinator Loaded");

API.on(API.CHAT_COMMAND, newChatCommand);

var botEnabled = true;

var canterlockUsers = {};
var capslockrepetition = 2;
var capslockOn = false;

function newChat(data)
{
    if (botEnabled)
    {
        //Tells the source code for the bot
        //!source || !sourcecode
        if (data.message.toLowerCase().indexOf('!source') > -1 || data.message.toLowerCase().indexOf('!sourcecode') > -1)
            sourceCode(data);

        //Tells the next my little pony episode using Yahoo APIs and PonyCountdown APIs
        //!nextepisode || !nextep
        if (data.message.toLowerCase().indexOf('!nextepisode') > -1 || data.message.toLowerCase().indexOf('!nextep') > -1)
            nextEpisode(data);

        //Anti canterlock bot stuff
        if (data.message.toUpperCase() == data.message && data.message.length > 5 && capslockOn == true)
            canterlock(data);

        //disables the bot
        //bouncers+
        //!disablebot
        if (data.message.toLowerCase().indexOf('!disablebot') > -1 && API.hasPermission(data.fromID, 2))
            disable(data, false);

    }
    else
    {
        //enables the bot
        //bouncers+
        //!enablebot
        if (data.message.toLowerCase().indexOf('!enablebot') > -1 && API.hasPermission(data.fromID, 2))
            enable(data, false);
    }

}

function newChatCommand(data)
{
    if (botEnabled)
    {
        //disable bot
        // /disable
        if (data.toLowerCase().indexOf('disable') > -1)
            disable(data, true);

        //turn off canterlock checking
        // /canterlockoff
        if (data.toLowerCase().indexOf('canterlockoff') > -1)
            disableCanterlock(data);

        //turn on canterlock checking
        // /canterlockon
        if (data.toLowerCase().indexOf('canterlockon') > -1)
            enableCanterlock(data);
    }

    //enable bot
    // /enable
    if (data.toLowerCase().indexOf('enable') > -1)
        enable(data, true);
}

function sourceCode(data)
{
    API.sendChat("The sourcecode for Botinator, gbear605's bot, can be found at https://github.com/Gbear605/Botinator");
}

function nextEpisode(data)
{
    var nextepisodeJSON = $.getJSON("http://query.yahooapis.com/v1/public/yql?q=select * from json where url=\"http://api.ponycountdown.com/next\"&format=json");
    //waits for the JSON to load, then does stuff in curly braces
    nextepisodeJSON.complete(function ()
    {
        var nextepisodetimeJSON = $.getJSON("http://query.yahooapis.com/v1/public/yql?q=select * from json where url=\"http://api.ponycountdown.com/until/next\"&format=json");
        var nextEpisodeName = nextepisodeJSON.responseJSON.query.results.json.name;
        //waits for the JSON to load, then does stuff in curly braces
        nextepisodetimeJSON.complete(function ()
        {
            var nextepisodetime = nextepisodetimeJSON.responseJSON.query.results.json;
            var nextEpisodeTimeDays = Math.round(((nextepisodetime / (1000 * 60 * 60 * 24))));
            var nextEpisodeTimeHours = Math.round(((nextepisodetime / (1000 * 60 * 60)) % 24));
            var nextEpisodeTimeMinutes = Math.round(((nextepisodetime / (1000 * 60)) % 60));
            var nextEpisodeTimeSeconds = Math.round(((nextepisodetime / 1000) % 60); 
            API.sendChat("The next episode is \"" +
                nextEpisodeName + "\" and it is in " +
                nextEpisodeTimeDays + " days, " +
                nextEpisodeTimeHours + " hours, " +
                nextEpisodeTimeMinutes + " minutes, and " +
                nextEpisodeTimeSeconds + " seconds.");
        });
    });
}

function canterlock(data)
{
    var userfrom = data.from;

    //check whether this is the first time using canterlock
    if (userfrom in canterlockUsers)
        canterlockUsers[userfrom]++;
    else
        canterlockUsers[userfrom] = 1;

    if (canterlockUsers[userfrom] % capslockrepetition == 1)
        API.sendChat("!rule 8 @" + userfrom + " has used canterlock " + canterlockUsers[userfrom] + " times.");
}

function enable(data, privateCommand)
{
    botEnabled = true;
    if (privateCommand)
        API.chatLog("Botinator Enabled.");
    else
        API.sendChat("Botinator Enabled.");
}

function disable(data, privateCommand)
{
    botEnabled = false;
    if (privateCommand)
        API.chatLog("Botinator Disabled.");
    else
        API.sendChat("Botinator Disabled.");
}

function disableCanterlock(data)
{
    capslockOn = false;
}

function enableCanterlock(data)
{
    capslockOn = true;
}
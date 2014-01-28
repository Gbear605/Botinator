var botEnabled = true;

var canterlockUsers = {};
var capslockrepetition = 2;
var capslockOn = false;

var autowoot = true;
var autojoin = true;

var history = API.getHistory();

var nextSong;

var nextSongInHistory;

var boop = new Audio('https://github.com/Gbear605/Botinator/raw/master/Boop.wav');

var nextEpisodeAPISite = "http://api.ponycountdown.com/next";
nextEpisodeAPISite = "http://query.yahooapis.com/v1/public/yql?q=select * from json where url=\"" + nextEpisodeAPISite + "\"&format=json";
var nextepisodeJSON = $.getJSON(nextEpisodeAPISite, function ()
{
    var nextEpisodeName = nextepisodeJSON.responseJSON.query.results.json.name;
});

function loadNextEpisode()
{
    nextepisodeJSON = $.getJSON(nextEpisodeAPISite, function ()
    {
        nextEpisodeName = nextepisodeJSON.responseJSON.query.results.json.name;
    });
}


function nextEpisode()
{
    var nextepisodeJSON = $.getJSON(nextEpisodeAPISite, function ()
    {
        var nextEpisodeName = nextepisodeJSON.responseJSON.query.results.json.name;
        API.sendChat("The next episode is \"" + nextEpisodeName + "\"");
    });
}

function canterlock(data)
{
    var userfrom = data.from;

    //check whether this is the first time using canterlock
    if (userfrom in canterlockUsers)
    {
        canterlockUsers[userfrom] += 1;
    }
    else
    {
        canterlockUsers[userfrom] = 1;
    }

    if (canterlockUsers[userfrom] % capslockrepetition === 1)
    {
        API.sendChat("!rule 8 @" + userfrom + " has used canterlock " + canterlockUsers[userfrom] + " times.");
    }
}

function enable(privateCommand)
{
    botEnabled = true;
    if (privateCommand)
    {
        API.chatLog("Botinator Enabled.");
    }
    else
    {
        API.sendChat("Botinator Enabled.");
    }
    privateCommand = null;
}

function disable(privateCommand)
{
    botEnabled = false;
    if (privateCommand)
    {
        API.chatLog("Botinator Disabled.");
    }
    else
    {
        API.sendChat("Botinator Disabled.");
    }
    privateCommand = null;
}

function checkHistory()
{
    var i;
    history = API.getHistory();
    nextSongInHistory = false;
    nextSong = API.getNextMedia();
    for (i = 0; i < history.length-1; i++)
    {
        if (nextSong.media.cid == history[i].media.cid)
        {
            place = i+1;
            API.chatLog("The current song is in history at place " + place + "!");
            nextSongInHistory = true;
            boop.play();
        }

    }
}

function newChat(data)
{
    var message = data.message.toLowerCase().split(' ');
    console.log(message);
    if (botEnabled)
    {
        //Tells the source code for the bot
        //!source || !sourcecode
        if (message[0] == '!source' || data.message.toLowerCase().indexOf('!sourcecode') > -1)
        {
            var sourceCodeSite = "https://github.com/Gbear605/Botinator";
            API.sendChat("The sourcecode for Botinator, gbear605's bot, can be found at " + sourceCodeSite);
        }

        //Tells the next my little pony episode using Yahoo APIs and PonyCountdown APIs
        //!nextepisode || !nextep || !next
        if (message[0] == '!nextepisode' || message[0] == '!nextep' || message[0] == '!next')
        {
            nextEpisode();
        }

        //Anti canterlock bot stuff
        if (data.message.toUpperCase() === data.message && data.message.length > 5 && capslockOn === true)
        {
            canterlock(data);
        }

        //says how many points the user needs to get the next level of avatars
        //!points || !pts
        if (message[0] == '!points' || message[0] == '!pts')
        {
            API.sendChat("@" + data.from + " Botinator's point checker is not done yet. This is a placeholder command.");
        }

        //disables the bot
        //bouncers+
        //!disable
        if (message[0] == '!disable' && API.hasPermission(data.fromID, 1) && message[1] == ('@' + API.getUser().username))
        {
            disable(false);
        }

        //says the bot's status
        //!status
        if (message[0] == '!status' && (message[1] == ('@' + API.getUser().username) || message[1] == (API.getUser().username)))
        {
            API.sendChat("@" + data.from + " - Status: Running Botinator, autowoot: " + autowoot + ", autojoin: " + autojoin);
        }

        // http://istodaythedaymartymcflyarriveswhenhetravelstothefuture.com/
        // !marty || !mcfly || !future || !bttf || !2015
        if(message[0] == "!marty" || message[0] == "!mcfly" || message[0] == "!future" || message[0] == "!bttf" || message[0] == "!2015")
        {
            API.sendChat("@" + data.from + " http://istodaythedaymartymcflyarriveswhenhetravelstothefuture.com/");
        }

        //links http://answeranything.tumblr.com/
        // !answers || !answer
        if(message[0] == "!answers" || message[0] == "!answer")
        {
            API.sendChat("@" + data.from + " http://answeranything.tumblr.com/");
        }

        //lmgtfy
        // !google [STUFF]
        if(message[0] == "!google")
        {
            var googleString = "";
            for(var i = 1; i < message.length; i++)
            {
                googleString = googleString + message[i] + "+";
            }
            API.sendChat("@" + data.from + " http://lmgtfy.com/?q=" + googleString);
        }


    }
    else
    {
        //enables the bot
        //bouncers+
        //!enablebot
        if (data.message.toLowerCase().indexOf('!enablebot') > -1 && API.hasPermission(data.fromID, 2))
        {
            enable(false);
        }
    }

}

function newChatCommand(data)
{
    var message = data.toLowerCase().split(' ');
    console.log(message);
    if (botEnabled)
    {
        //disable bot
        // /disable
        if (message[0] == "/disable")
        {
            disable(true);
        }

        //turn off canterlock checking
        // /canterlockoff
        if (message[0] == '/canterlockoff')
        {
            capslockOn = false;
            API.chatLog("Canterlock Disabled");
        }

        //turn on canterlock checking
        // /canterlockon
        if (message[0] == '/canterlockon')
        {
            capslockOn = true;
            API.chatLog("Canterlock Enabled");
        }

        //check if next song is in history
        // /nextsong
        if (message[0] == '/nextsong')
        {
            checkHistory();
        }

        //disable autojoin
        // /j
        if (message[0] == '/j')
        {
            if (autojoin)
            {
                autojoin = false;
                API.chatLog("auto join disabled");
            }
            else
            {
                autojoin = true;
                API.chatLog("auto join enabled");

            }
        }

        //disable autowoot
        // /w
        if (message[0] == '/w')
        {
            if (autowoot)
            {
                autowoot = false;
                API.chatLog("auto woot disabled");

            }
            else
            {
                autowoot = true;
                API.chatLog("auto woot enabled");

            }
        }

        //prepares an @ message to all the mods
        ///mod || /mods
        if (message[0] == "/mod" || message[0] == "/mods")
        {
            var staffList = API.getStaff();
            var modString = "";
            var i;
            for (i = 0; i < staffList.length; i++)
            {
                if (staffList[i].permission != 1 && staffList[i].status != 1)
                {
                    modString = modString + " @" + staffList[i].username;
                }
            }
            if (message[1] == "true" || message[1] == "all" || message[1] == "public" || message[1] == "chat")
            {
                API.sendChat(modString);
            }
            else
            {
                API.chatLog(modString);
            }
        }

        //Boop!
        // /boop
        if(message[0] == "/boop")
        {
            boop.play();
        }

        //Loads the next episode info
        // /load
        if(message[0] == "/load")
        {
            loadNextEpisode();
        }
    }

    //enable bot
    // /enable
    if (message[0] == '/enable')
    {
        enable(true);
    }
}

function userJoined(user)
{
    if(user.relationship == 0)
    {
        API.chatLog(user.username + " joined the room.");
    }
}

function friendJoined(user)
{
    API.chatLog("Your friend " + user.username + " just joined the room");
}

function fanJoined(user)
{
    API.chatLog("Your fan " + user.username + " just joined the room");
}

function userLeft(user)
{
    API.chatLog(user.username + " left the room");
}

function nextDJ(data)
{
    var i;
    if (autowoot)
    {
        $("#woot").click();
    }
    if (autojoin)
    {
        if (data.lastPlay.dj.id == API.getUser().id)
        {
            API.djJoin();
        }
    }
    API.chatLog(data.dj.username + " is playing " + data.media.title + " by " + data.media.author);
    for (i = 0; i < history.length; i++)
    {
        if (data.media.cid == history[i].media.cid)
        {
            API.chatLog("The current song is in history at place " + i + "!");
            boop.play();
        }
    }
    checkHistory();
}

function voteUpdate(data)
{
    if (data.vote == -1)
    {
        API.chatLog(data.user.username + " mehed.");
    }
}

function curateUpdate(data)
{
    var media = API.getMedia();
    API.chatLog(data.user.username + " curated " + media.author + " - " + media.title + ".");
}

API.chatLog("Botinator Loaded");

API.on(API.CHAT, newChat);

API.on(API.CHAT_COMMAND, newChatCommand);

API.on(API.USER_JOIN, userJoined);

API.on(API.FRIEND_JOIN, friendJoined);

API.on(API.FAN_JOIN, fanJoined);

API.on(API.USER_LEAVE, userLeft);

API.on(API.DJ_ADVANCE, nextDJ);

API.on(API.VOTE_UPDATE, voteUpdate);

API.on(API.CURATE_UPDATE, curateUpdate);
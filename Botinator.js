//Vast credit to Mateon1, the maker of PlugPlug and overall awesome person.

var botEnabled = true;

var canterlockUsers = {},
    capslockrepetition = 2,
    capslockOn = false,
    history = API.getHistory(),
    nextSong,
    nextSongInHistory,
    lastVol = API.getVolume(),
    isMuted = !lastVol,
    artMute = false,
    boop = new Audio('https://github.com/Gbear605/Botinator/raw/master/Boop.wav'),
    nextEpisodeAPISite = "http://api.ponycountdown.com/next";

nextEpisodeAPISite = "http://query.yahooapis.com/v1/public/yql?q=select * from json where url=\"" + nextEpisodeAPISite + "\"&format=json";

var nextepisodeJSON = $.getJSON(nextEpisodeAPISite, function ()
{
    var nextEpisodeName = nextepisodeJSON.responseJSON.query.results.json.name;
});

function woot() {
    $("#woot").click();
}

function meh() {
    $("#meh").click();
}

setInterval(function () {
    isMuted = !API.getVolume();
    if (!isMuted) {
        artMute = isMuted = false;
    }
    if (!artMute) {
        lastVol = API.getVolume();
    }
}, 5000);

function rset(expr, value) {
    var a = (value || true) && JSON.parse(localStorage.Botinator);
    eval("a" + expr + " = value;");
    localStorage.Botinator = JSON.stringify(a);
}

function get(prop) {
    return JSON.parse(localStorage.Botinator)[prop];
}

function set(prop, value) {
    var a = JSON.parse(localStorage.Botinator);
    a[prop] = value;
    localStorage.Botinator = JSON.stringify(a);
}

function statUp(e, t) {
    var n = JSON.parse(localStorage.Botinator);
    switch (e) {
    case "join":
    case "joined":
        n.stats[t].joined += 1;
        break;
    case "play":
    case "played":
    case "djed":
        n.stats[t].songs.played += 1;
        break;
    case "skip":
    case "skipped":
        n.stats[t].songs.skipped += 1;
        break;
    case "woot":
    case "wooted":
        n.stats[t].votes.ratio = (n.stats[t].votes.woot += 1) / (n.stats[t].votes.meh + n.stats[t].votes.woot);
        break;
    case "meh":
    case "mehed":
        n.stats[t].votes.ratio = n.stats[t].votes.woot / (n.stats[t].votes.woot + (n.stats[t].votes.meh += 1));
        break;
    default:
        console.error("statUp(): unknown stat \"" + e + "\"");
    }
    localStorage.Botinator = JSON.stringify(n);
}

if (!localStorage.hasOwnProperty("Botinator")) {
    localStorage.Botinator = JSON.stringify({
        "autowoot"      : true,
        "autojoin"      : true,
        "automehed"     : {},// media.id: reason
        "automuted"     : [],// [media.id, ...]
        "stats"         : {},
        "user2ID"       : {},// username: [ID1, ID2]
        "chatBan"       : [] // [/text1/, ...] (toString()ed cause cannot store regExps directly)
    });
} else {
    if (get("autowoot") === undefined) {set("autowoot", true); }
    if (get("autojoin") === undefined) {set("autojoin", false); }
    if (get("automehed") === undefined) {set("automehed", {}); }
    if (get("automuted") === undefined) {set("automuted", []); }
    if (get("stats") === undefined) {set("stats", {}); }
    if (get("user2ID") === undefined) {set("user2ID", {}); }
    if (get("chatBan") === undefined) {set("chatBan", []); }
}

function unmute() {
    var a = isMuted;
    if (isMuted) {
        artMute = isMuted = false;
        API.setVolume(lastVol);
    }
    return a;
}

function mute() {
    var a = isMuted;
    if (!isMuted) {
        lastVol = API.getVolume();
        artMute = isMuted = true;
        API.setVolume(0);
    }
    return !a;
}

function join() {
    API.djJoin();
}

function initUser(id) {
    if (get("stats")[id] === undefined) {
        rset(".stats[\"" + id + "\"]", {    "joined"    : 0,
                        "songs": {  "played" :  0,
                                    "skipped":  0},
                        "chat"  : { "#"      :  0,
                                    "last"   :  new Date(0),
                                    "avglen" :  0
                            },
                        "votes" :
                            {"woot" : 0,
                            "meh"   : 0,
                            "ratio" : 1
                            }
            });
    }
    if (get("user2ID")[API.getUser(id).username] === undefined) {
        rset(".user2ID[\"" + API.getUser(id).username + "\"]", [id]);
    } else if (get("user2ID")[API.getUser(id).username].indexOf(id) < 0) {
        rset(".user2ID[\"" + API.getUser(id).username + "\"].push(\"" + id + "\")//");
    }
}

function reset(clear) {
    var u = API.getUsers(), i;
    if (clear === true) { // Must be true, not anything else to clear...
        set("stats", {});
        set("user2ID", {});
        set("automehed", {});
    }
    for (i = u.length; (i -= 1) > 0; i -= 0) {
        initUser(u[i].id);
    }
}

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

function botDisable(privateCommand, data)
{
    botEnabled = false;
    if (privateCommand)
    {
        API.chatLog("@" + data.from + " Botinator Disabled.");
    }
    else
    {
        API.sendChat("@" + data.from + " Botinator Disabled.");
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
            API.chatLog("Your next song is in history at place " + place + "!");
            nextSongInHistory = true;
            boop.play();
        }

    }
}

function newChat(data)
{
    var message = data.message.replace(/&#39;/g, "'")
                                .replace(/&amp;/g, "&")
                                .replace(/&#34;/g, "\"")
                                .replace(/&#59;/g, ";")
                                .replace(/&lt;/g, "<")
                                .replace(/&gt;/g, ">")
                                .toLowerCase().split(' '),
        mentioned = message.indexOf("@" + API.getUser().username) !== -1,
        perm      = API.getUser(data.fromID).permission;
    console.log("[" + data.from + "]" + message);
    if (botEnabled)
    {
        //Tells the source code for the bot
        //!source || !sourcecode
        if (message.indexOf('!source') !== -1 || message.indexOf('!sourcecode') !== -1)
        {
            var sourceCodeSite = "https://github.com/Gbear605/Botinator";
            API.sendChat("The sourcecode for Botinator, gbear605's bot, can be found at " + sourceCodeSite);
        }

        //Tells the next my little pony episode using Yahoo APIs and PonyCountdown APIs
        //!nextepisode || !nextep || !next
        if (message.indexOf('!nextepisode') !== -1 || message.indexOf('!nextep') !== -1 || message.indexOf('!next') !== -1)
        {
            nextEpisode();
        }

        //Anti canterlock bot stuff
        if (data.message.toUpperCase() === data.message && data.message.length > 5 && capslockOn === true)
        {
            canterlock(data);
        }

        //disables joining
        //bouncers+
        //!disable
        if (message.indexOf('!disable') !== -1 && API.hasPermission(data.fromID, 1) && mentioned)
        {
            set("autojoin", false);
            API.chatLog("@" + data.from + " Botinator auto join disabled. To disable the bot, use !botdisable or !botoff");
        }

        //disables the bot
        //bouncers+
        //!botdisable || !botoff
        if ((message.indexOf("!botdisable") !== -1 || message.indexOf("!botoff") !== -1) && API.hasPermission(data.fromID, 1) && mentioned)
        {
            botDisable(false, data);
        }

        //says the bot's status
        //!status
        if (message.indexOf("!status") !== -1 && mentioned)
        {
            API.sendChat("@" + data.from + " - Status: Running Botinator, autowoot: " + get("autowoot") + ", autojoin: " + get("autojoin"));
        }

        // http://istodaythedaymartymcflyarriveswhenhetravelstothefuture.com/
        // !marty || !mcfly || !future || !bttf || !2015
        if(message.indexOf('!marty') !== -1 || message.indexOf('!mcfly') !== -1 || message.indexOf('!future') !== -1 || message.indexOf('!bttf') !== -1 || message.indexOf('!2015') !== -1)
        {
            API.sendChat("@" + data.from + " http://istodaythedaymartymcflyarriveswhenhetravelstothefuture.com/");
        }

        //links http://answeranything.tumblr.com/
        // !answers || !answer
        if(message.indexOf('!answers') !== -1 || message.indexOf('!answer') !== -1)
        {
            API.sendChat("@" + data.from + " http://answeranything.tumblr.com/");
        }

        //lmgtfy
        // !google [STUFF]
        if(message.indexOf('!google') === 0)
        {
            var googleString = "";
            for(var i = 1; i < message.length; i++)
            {
                if(i != message.length-1)
                {
                    googleString = googleString + message[i] + "+";
                }
                else
                {
                    googleString = googleString + message[i];
                }
            }
            API.sendChat("@" + data.from + " http://lmgtfy.com/?q=" + googleString);
        }


    }
    else
    {
        //enables the bot
        //bouncers+
        //!enablebot
        if (message.indexOf('!enablebot') !== -1 > -1 && API.hasPermission(data.fromID, 2) && mentioned)
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
            botDisable(true);
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
            if (get("autojoin") === true)
            {
                set("autojoin", true);
                API.chatLog("auto join disabled");
            }
            else
            {
                set("autojoin", false);
                API.chatLog("auto join enabled");

            }
        }

        //disable autowoot
        // /w
        if (message[0] == '/w')
        {
            if (get("autowoot") === true)
            {
                set("autowoot", true);
                API.chatLog("auto woot disabled");

            }
            else
            {
                set("autowoot", false);
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

        if(message[0] == "/mute")
        {
            mute();
        }
        if(message[0] == "/unmute")
        {
            unmute();
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
    unmute();
    var i;
    if (get("autowoot")) {
        (get("automehed").hasOwnProperty(data.media.id) ? meh : woot)();
    }

    if ((API.getWaitListPosition() === -1) && get("autojoin")) {
        join();
    }

    if (get("automuted").indexOf(data.media.id) !== -1) {
        if (!isMuted) {
            setTimeout(mute, 3500);
        }
    } else {
        if (artMute) {
            setTimeout(unmute, 3500);
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
        statUp("meh", data.user.id);
    }
    else
    {
        statUp("woot", data.user.id);
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
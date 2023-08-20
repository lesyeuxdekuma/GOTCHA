// Decide whether to load #new or #main
function restartOrContinue() {
    // Load main if there is local storage history
    if (localStorage.getItem("gameState")) var div = "main";

    // Load new if there is no local storage history
    else var div = "new";

    // Load selected div
    $(`#${div}`).show();

    // Return active div
    return div;
}

// Dynamically adjust top margin of active div
function setWindowStart() {
    // Get height of header
    var headerHeight = $("#header").outerHeight();
    
    // Set active div top margin equal to height of heading
    if ($("#new").css("display") == "none" && $("#minigame").css("display") == "none") {
        $("#main").css("margin-top", headerHeight + "px");
    } else if ($("#main").css("display") == "none" && $("#minigame").css("display") == "none") {
        $("#new").css("margin-top", headerHeight + "px");
    } else {
        $("#minigame").css("margin-top", headerHeight + "px");
    }

    // Calculate header height compared to window height
    var difference = $(window).height() - headerHeight;

    // Set the difference as min-vh for body
    $("body").css("min-height", difference + "px");
}

// Validate name input
function validateName(name) {
    // Get alert placeholder div and initialize variables
    const placeholder = $("#alertPlaceholder");
    var message, isValid;

    // Empty contents of placeholder, if any
    placeholder.empty();

    // Invalidate if name is empty
    if (!name) {
        isValid = false;
        message = "Name cannot be empty!"

    // Otherwise, ensure name is only letters and whitespaces
    } else {
        isValid = /^[a-zA-Z\s]+$/.test(name)
        if (!isValid) message = "Name can only contain letters and whitespace!"

        // Also, ensure name is only 15 letters at most
        else {
            if (name.length > 15) {
                isValid = false;
                message = "Name cannot be longer than 15 characters!"
            }
        }
    }

    // Add alert to placeholder if invalid
    if (!isValid) {
        const alert = `
            <div class="alert alert-danger alert-dismissible" role="alert">
                <div>${message}</div>
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `;
        placeholder.append(alert);
    }

    // Return check result
    return isValid;
}

// Decide what to greet user based on time and statuses
function getGreeting(time, eat, sleep, play, med) {
    // Initialize greeting
    var greeting; 

    // Decide based on time of day
    const hour = new Date(time).getHours();
    if (hour >= 5 && hour < 12) greeting = "Good morning!";
    else if (hour >= 12 && hour < 18) greeting = "Good afternoon!";
    else if (hour >= 18 && hour < 21) greeting = "Good evening!";
    else greeting = "Good night!";

    // Consider statuses
    if (eat >= 75 && eat <= 100 && sleep >= 75 && sleep <= 100 && play >= 75 && med >= 75 && med <= 100) greeting += " I feel very great!";
    else if (eat >= 50 && eat < 75 && sleep >= 50 && sleep < 75 && play >= 50 && play < 75 && med >= 50 && med < 75) greeting += "I feel good!";
    else if (eat >= 25 && eat < 50 && sleep >= 25 && sleep < 50 && play >= 25 && play < 50 && med >= 25 && med < 50) greeting += "I need help!";
    else if (eat < 25 && sleep < 25 && play < 25 && med < 25) greeting += "I don't feel so good...";

    // If all are not level, check individual status levels and add appropriate phrases
    else {
        // Initialize empty stack for phrases
        const statusPhrases = [];

        // Push any instance of hunger
        if (eat < 25) statusPhrases.push("super hungry");
        else if (eat < 50) statusPhrases.push("hungry");
        else if (eat < 75) statusPhrases.push("a bit hungry");
        
        // Push any instance of sleepiness
        if (sleep < 25) statusPhrases.push("super sleepy");
        else if (sleep < 50) statusPhrases.push("sleepy");
        else if (sleep < 75) statusPhrases.push("a bit sleepy");
        
        // Push any instance of boredom
        if (play < 25) statusPhrases.push("super bored");
        else if (play < 50) statusPhrases.push("bored");
        else if (play < 75) statusPhrases.push("a bit bored");
        
        // Push any instance of illness
        if (med < 25) statusPhrases.push("super unwell");
        else if (med < 50) statusPhrases.push("unwell");
        else if (med < 75) statusPhrases.push("a bit unwell");

        // Start of with "I'm "
        greeting += " I'm ";

        // Simply end with period if only 1 issue
        if (statusPhrases.length === 1) greeting += statusPhrases[0] + ".";

        // Join with "and" if 2 issues
        else if (statusPhrases.length === 2) greeting += statusPhrases.join(" and ") + ".";

        // Use commas for more than 2 issues
        else {
            const lastPhrase = statusPhrases.pop();
            greeting += statusPhrases.join(", ") + ", and " + lastPhrase + ".";
        }
    }
        
    // Return full greeting
    return greeting;
}

// Decide status bar color based on levels
function statusColor(value) {
    if (value <= 25) return "progress-bar bg-danger";
    else if (value <= 50) return "progress-bar bg-warning";
    else if (value <= 75) return "progress-bar bg-success";
    else return "progress-bar bg-info";
}

// Initialize flag for greeting bubble synchronization
var fullyDisabled = false;
var disabledButtons = false;
var isTalking = false;

    // Set background based on time
    function setBackground(time) {
        // Decide background on time of day
        var background;
        const hour = new Date(time).getHours();
        if (hour >= 3 && hour < 6) background = "1.jpg" 
        else if (hour >= 6 && hour < 8) background = "2.jpg";
        else if (hour >= 8 && hour < 16) background = "3.png";
        else if (hour >= 16 && hour < 17) background = "4.jpg";
        else if (hour >= 17 && hour < 18) background = "5.png";
        else if (hour >= 18 && hour < 20) background = "6.png";
        else background = "0.jpg";

        // Set background on body
        $("body").css("background-image", `url("resources/bg/${background}")`);
    }

// Timeout will callback
function setTimeoutWithDisabledButtons(callback, time) {
    setTimeout(() => {
        $("#activities button").prop("disabled", false);
        disabledButtons = false;
        callback();
    }, time);
}

// Load contents for #main
function loadMain() {
    // Load game state
    const gameState = JSON.parse(localStorage.getItem("gameState"));

    // Load and set name
    const name = $("#petName");
    name.text(gameState.name);

    // Load level and set its corresponding value
    $("#level").text(`LEVEL ${gameState.level}`);

    // Load avatar and set pet's image to selected avatar
    $("#petImage").attr("src", `resources/${gameState.avatar}/level${gameState.level}/idle.gif`);
    if (gameState.level == 1) $("#petImage").css("width", "10%");
    else if (gameState.level == 2) $("#petImage").css("width", "15%");
    else $("#petImage").css("width", "30%");


    // Load greeting and time and set its corresponding saved values
    const greeting = $("#greeting");
    const time = $("#time");
    greeting.text(getGreeting(time, gameState.eat, gameState.sleep, gameState.play, gameState.med));
    time.text(new Date(gameState.time).toLocaleTimeString([], {hour: "2-digit", minute:"2-digit"}));

    // Load progress bars for each stat and set its corresponding saved values
    const eatStat = $("#eatStat .progress");
    const sleepStat = $("#sleepStat .progress");
    const playStat = $("#playStat .progress");
    const medStat = $("#medStat .progress");
    eatStat.attr("aria-valuenow", gameState.eat);
    eatStat.find(".progress-bar").css("width", `${gameState.eat}%`).removeClass().addClass(statusColor(gameState.eat));
    sleepStat.attr("aria-valuenow", gameState.sleep);
    sleepStat.find(".progress-bar").css("width", `${gameState.sleep}%`).removeClass().addClass(statusColor(gameState.sleep));
    playStat.attr("aria-valuenow", gameState.play);
    playStat.find(".progress-bar").css("width", `${gameState.play}%`).removeClass().addClass(statusColor(gameState.play));
    medStat.attr("aria-valuenow", gameState.med);
    medStat.find(".progress-bar").css("width", `${gameState.med}%`).removeClass().addClass(statusColor(gameState.med));

    // Set an interval to increment the time every second
    const mainInterval = setInterval(() => {
        // Add 1 minute to the current time
        gameState.time = new Date(gameState.time);
        gameState.time.setMinutes(gameState.time.getMinutes() + 1);

        // Update the time element in the HTML
        time.text(new Date(gameState.time).toLocaleTimeString([], {hour: "2-digit", minute:"2-digit"}));

        // Increment timer
        gameState.timer++;

        // Update background based on time
        if (!fullyDisabled) setBackground(gameState.time);

        // For every 10 game minutes
        if (gameState.timer % 10 == 0 && !disabledButtons) {
            // Decrease every stat by 1 point
            if (gameState.eat != 0) gameState.eat--;
            if (gameState.sleep != 0) gameState.sleep--;
            if (gameState.play != 0) gameState.play--;
            if (gameState.med != 0) gameState.med--;
            
            // Cap levels at 0
            if (gameState.eat < 0) gameState.eat = 0;
            if (gameState.sleep < 0) gameState.sleep = 0;
            if (gameState.play < 0) gameState.play = 0;
            if (gameState.med < 0)gameState.med = 0;

            // Update status bars
            eatStat.attr("aria-valuenow", gameState.eat);
            eatStat.find(".progress-bar").css("width", `${gameState.eat}%`).removeClass().addClass(statusColor(gameState.eat));
            sleepStat.attr("aria-valuenow", gameState.sleep);
            sleepStat.find(".progress-bar").css("width", `${gameState.sleep}%`).removeClass().addClass(statusColor(gameState.sleep));
            playStat.attr("aria-valuenow", gameState.play);
            playStat.find(".progress-bar").css("width", `${gameState.play}%`).removeClass().addClass(statusColor(gameState.play));
            medStat.attr("aria-valuenow", gameState.med);
            medStat.find(".progress-bar").css("width", `${gameState.med}%`).removeClass().addClass(statusColor(gameState.med));
        }

        // Death screens
        if (gameState.eat <= 0 || gameState.sleep <= 0 || gameState.play <= 0 || gameState.med <= 0) {
            // Disable everything for safety measures
            fullyDisabled = true;
            clearInterval(mainInterval);
            
            // Toggle death screen modal at any 0 level
            $("#deathScreen").modal("toggle");

            // Set dead avatar and title
            $("#deadAvatar").attr("src", `resources/${gameState.avatar}/level${gameState.level}/idle.gif`);
            $("#deathScreenLabel").text("YOUR PET DIED!");
            
            // Set death title based on depleted level
            if (gameState.eat <= 0) $("#deathScreenMessage").text(`${name.text()} died of severe hunger...`);
            else if (gameState.sleep <= 0) $("#deathScreenMessage").text(`${name.text()} died of sleep deprivation...`);
            else if (gameState.play <= 0) $("#deathScreenMessage").text(`${name.text()} died of enormous boredom...`);
            else $("#deathScreenMessage").text(`${name.text()} died of terrible health...`);

            // Clear local storage
            localStorage.clear();

            // Automatic refresh after 5 seconds
            setTimeout(() => {
                fullyDisabled = false;
                disabledButtons = false;
                isTalking = false;
                location.reload();
            }, 8000);
        }

        // Run level timers for levels on limit
        if (gameState.eatTimer > 0) gameState.eatTimer++;
        if (gameState.sleepTimer > 0) gameState.sleepTimer++;
        if (gameState.playTimer > 0) gameState.playTimer++;
        if (gameState.medTimer > 0) gameState.medTimer++;
        
        // Refresh eat and play limit every 2 game hours
        if (gameState.eatTimer != 0 && gameState.eatTimer % 120 == 0) if (--gameState.eatCounter == 0) gameState.eatTimer = 0;
        if (gameState.playTimer != 0 && gameState.playTimer % 120 == 0) if (--gameState.playCounter == 0) gameState.playTimer = 0;
        
        // Refresh sleep and medicine limit every 6 game hours
        if (gameState.sleepTimer != 0 && gameState.sleepTimer % 360 == 0) if (--gameState.sleepCounter == 0) gameState.sleepTimer = 0;
        if (gameState.medTimer != 0 && gameState.medTimer % 360 == 0) if (--gameState.medCounter == 0) gameState.medTimer = 0;

        // Level up to level 2 after half a day
        if (gameState.level == 1 && gameState.timer >= 720) {
            // Increase level
            gameState.level = 2;
            $("#level").text(`LEVEL ${gameState.level}`);

            // Change pet form with glow effect
            $("#petImage").removeClass("pet-glow");
            $("#petImage").attr("src", `resources/${gameState.avatar}/level${gameState.level}/idle.gif`);
            $("#petImage").css("width", "15%");
            setTimeout(() => $("#petImage").addClass("pet-glow"), 50);
        } 

        // Level up to level 3 after another day
        if (gameState.level == 2 && gameState.timer >= 2160) {
            // Increase level
            gameState.level = 3;
            $("#level").text(`LEVEL ${gameState.level}`);

            // Change pet form with glow effect
            $("#petImage").removeClass("pet-glow");
            $("#petImage").attr("src", `resources/${gameState.avatar}/level${gameState.level}/idle.gif`);
            $("#petImage").css("width", "30%");
            setTimeout(() => $("#petImage").addClass("pet-glow"), 50);
        }

        // Save the updated game state to local storage
        if (!fullyDisabled) localStorage.setItem("gameState", JSON.stringify(gameState));

        // Asynchronously update greeting
        if (!fullyDisabled && !disabledButtons && !isTalking) greeting.text(getGreeting(gameState.time, gameState.eat, gameState.sleep, gameState.play, gameState.med));
    }, 1000);

    // Eat event
    $("#eat").click(() => {
        // Cap 5 consecutive eat events without refresh
        if (gameState.eatCounter == 5) {
            greeting.text("I'm too full, let my tummy rest...");
            isTalking = true;
            setTimeout(() => {
                greeting.text(getGreeting(gameState.time, gameState.eat, gameState.sleep, gameState.play, gameState.med));
                isTalking = false;
            }, 2000);
            return;
        }

        // Restrict eating if still full
        if (gameState.eat == 100) {
            greeting.text("I've had enough food!");
            isTalking = true;
            setTimeout(() => {
                greeting.text(getGreeting(gameState.time, gameState.eat, gameState.sleep, gameState.play, gameState.med));
                isTalking = false;
            }, 2000);
            return;
        }

        // Add eat status by 10 and update eat limit
        gameState.eat += 15;
        gameState.eatCounter++; 
        gameState.eatTimer++;

        // Additionally, make pet a bit sleepier
        gameState.sleep -= 2;

        // Cap status levels
        if (gameState.eat > 100) gameState.eat = 100;
        if (gameState.sleep < 0) gameState.sleep = 0;

        // Save updated eat levels
        localStorage.setItem("gameState", JSON.stringify(gameState));

        // Update eat and sleep status bar
        eatStat.attr("aria-valuenow", gameState.eat);
        eatStat.find(".progress-bar").css("width", `${gameState.eat}%`).removeClass().addClass(statusColor(gameState.eat));
        sleepStat.attr("aria-valuenow", gameState.sleep);
        sleepStat.find(".progress-bar").css("width", `${gameState.sleep}%`).removeClass().addClass(statusColor(gameState.sleep));

        // Eat for 5 seconds
        greeting.text("NOM NOM NOM... Tasty!");
        $("#petImage").attr("src", `resources/${gameState.avatar}/level${gameState.level}/eat.gif`);
        $("#onActivity").attr("src", `resources/main/oneat.gif`);
        $("#activities button").prop("disabled", true);
        disabledButtons = true;
        setTimeoutWithDisabledButtons(() => {
            greeting.text(getGreeting(gameState.time, gameState.eat, gameState.sleep, gameState.play, gameState.med));
            $("#petImage").attr("src", `resources/${gameState.avatar}/level${gameState.level}/idle.gif`);
            $("#onActivity").attr("src", "");
        }, 5000);
    });

    // Sleep event
    $("#sleep").click(() => {
        // Cap consecutive sleep events without refresh once
        if (gameState.sleepCounter == 1) {
            greeting.text("I just slept, I'm not sleepy anymore...");
            isTalking = true;
            setTimeout(() => {
                greeting.text(getGreeting(gameState.time, gameState.eat, gameState.sleep, gameState.play, gameState.med));
                isTalking = false;
            }, 2000);
            return;
        }

        // Restrict sleeping if still full
        if (gameState.sleep == 100) {
            greeting.text("I've had enough sleep!");
            isTalking = true;
            setTimeout(() => {
                greeting.text(getGreeting(gameState.time, gameState.eat, gameState.sleep, gameState.play, gameState.med));
                isTalking = false;
            }, 2000);
            return;
        }

        // Add sleep status by 50 and update sleep limit
        gameState.sleep += 50;
        gameState.sleepCounter++;
        gameState.sleepTimer++;

        // Additionally, make pet hungrier and more bored
        gameState.eat -= 5;
        gameState.play -= 5;

        // Cap status levels
        if (gameState.sleep > 100) gameState.sleep = 100;
        if (gameState.eat < 0) gameState.eat = 0;

        // Save updated eat levels
        localStorage.setItem("gameState", JSON.stringify(gameState));

        // Update eat and sleep status bar
        eatStat.attr("aria-valuenow", gameState.eat);
        eatStat.find(".progress-bar").css("width", `${gameState.eat}%`).removeClass().addClass(statusColor(gameState.eat));
        sleepStat.attr("aria-valuenow", gameState.sleep);
        sleepStat.find(".progress-bar").css("width", `${gameState.sleep}%`).removeClass().addClass(statusColor(gameState.sleep));

        // Sleep for 1 game hour
        greeting.text("Sleeping for 1 hour! Zzz... Zzz...");
        $("#onActivity").attr("src", `resources/main/onsleep.gif`);
        $("#onActivity").css("transform", "scaleX(-1)").css("filter", "saturate(0) drop-shadow(0 0 10px rgba(255, 255, 255, 0.8))").css("width", "15%");
        $("#activities button").prop("disabled", true);
        disabledButtons = true;
        setTimeoutWithDisabledButtons(() => {
            greeting.text(getGreeting(gameState.time, gameState.eat, gameState.sleep, gameState.play, gameState.med));
            $("#onActivity").attr("src", "");
            $("#onActivity").css("transform", "none").css("filter", "drop-shadow(0 0 10px rgba(255, 255, 255, 0.8))").css("width", "5%");
        }, 60000);
    });

    // Play event
    $("#play").click(() => {
        // Cap 5 consecutive play events without refresh
        if (gameState.playCounter == 100) {
            greeting.text("I just played so much, let me rest for a while...");
            isTalking = true;
            setTimeout(() => {
                greeting.text(getGreeting(gameState.time, gameState.eat, gameState.sleep, gameState.play, gameState.med));
                isTalking = false;
            }, 2000);
            return;
        }

        // Restrict playing if still full
        if (gameState.play == 100) {
            greeting.text("I've had enough playtime!");
            isTalking = true;
            setTimeout(() => {
                greeting.text(getGreeting(gameState.time, gameState.eat, gameState.sleep, gameState.play, gameState.med));
                isTalking = false;
            }, 2000);
            return;
        }

        // Add play status by 20 and update eat limit
        gameState.play += 20;
        gameState.playCounter++; 
        gameState.playTimer++;

        // Additionally, make pet a bit sleepier and hungrier
        gameState.eat -= 3;
        gameState.sleep -= 3;

        // Cap status levels
        if (gameState.play > 100) gameState.play = 100;
        if (gameState.eat < 0) gameState.eat = 0;
        if (gameState.sleep < 0) gameState.sleep = 0;

        // Save updated eat levels
        localStorage.setItem("gameState", JSON.stringify(gameState));

        // Update eat and sleep status bar
        eatStat.attr("aria-valuenow", gameState.eat);
        eatStat.find(".progress-bar").css("width", `${gameState.eat}%`).removeClass().addClass(statusColor(gameState.eat));
        sleepStat.attr("aria-valuenow", gameState.sleep);
        sleepStat.find(".progress-bar").css("width", `${gameState.sleep}%`).removeClass().addClass(statusColor(gameState.sleep));
        playStat.attr("aria-valuenow", gameState.play);
        playStat.find(".progress-bar").css("width", `${gameState.play}%`).removeClass().addClass(statusColor(gameState.play));

        // Start playing 
        greeting.text("Playing!");
        $("#activities button").prop("disabled", true);
        fullyDisabled = true;
        $("#main").hide();
        $("#minigame").show();
        setWindowStart();

        // Initialize variables for mini game
        var character = document.getElementById("character");
        $(character).attr("src", `resources/${gameState.avatar}/level${gameState.level}/play.gif`);
        var block = document.getElementById("block");
        let score = 0;
        var isJumping = false; 

        document.addEventListener('keydown', function(event) {
            if (event.code === 'Space' && !isJumping) { // add !isJumping so that the character can't jump twice at the same time
                jump();
            }
        });

        function jump() {
            if (character.classList != "animate" && !isJumping) {
                character.classList.add("animate");
                isJumping = true; // set isJumping to true when the character jumps
            }

            setTimeout(function() {
                character.classList.remove("animate");
                isJumping = false; // set isJumping to false when character after jumping
            }, 500);
        }
                
        var checkDead = setInterval(function() {
            var characterTop = parseInt(window.getComputedStyle(character).getPropertyValue("top"));
            var blockLeft = parseInt(window.getComputedStyle(block).getPropertyValue("left"));
            
            if (blockLeft < 20 && blockLeft > 0 && characterTop >= 157) {
                block.style.animation = "none";
                character.style.display = "none";
                alert("Your pet stumbled, try again next time! Your score is " + score + " points!");
                clearInterval(checkDead);

                //End of game
                fullyDisabled = false;
                $("#activities button").prop("disabled", fullyDisabled);
                block.style.animation = "block 1s infinite linear";
                block.style.display = "block";
                $("#minigame").hide();
                $("#main").show();
                setWindowStart();
                greeting.text(getGreeting(gameState.time, gameState.eat, gameState.sleep, gameState.play, gameState.med));
                location.reload();
            } else if (blockLeft < -20) {
                score ++;
                document.getElementById("score").innerText = score;
            }
        }, 10);
    });

    // Med event
    $("#med").click(() => {
        // Cap consecutive med events without refresh once
        if (gameState.medCounter == 1) {
            greeting.text("I just took some medicine, I'll do it later again...");
            isTalking = true;
            setTimeout(() => {
                greeting.text(getGreeting(gameState.time, gameState.eat, gameState.sleep, gameState.play, gameState.med));
                isTalking = false;
            }, 2000);
            return;
        }

        // Restrict medication if still full
        if (gameState.med == 100) {
            greeting.text("I've had enough medicine!");
            isTalking = true;
            setTimeout(() => {
                greeting.text(getGreeting(gameState.time, gameState.eat, gameState.sleep, gameState.play, gameState.med))
                isTalking = false;
            }, 2000);
            return;
        }

        // Add med status by 50 and update sleep limit
        gameState.med += 50;
        gameState.medCounter++;
        gameState.medTimer++;

        // Cap status levels
        if (gameState.med > 100) gameState.med = 100;

        // Save updated eat levels
        localStorage.setItem("gameState", JSON.stringify(gameState));

        // Update med status bar
        medStat.attr("aria-valuenow", gameState.med);
        medStat.find(".progress-bar").css("width", `${gameState.med}%`).removeClass().addClass(statusColor(gameState.med));

        // Take meds for 3 seconds
        greeting.text("Taking my medicine!");
        $("#petImage").addClass("pet-heal");
        $("#petImage").attr("src", `resources/${gameState.avatar}/level${gameState.level}/eat.gif`);
        $("#onActivity").attr("src", `resources/main/onmed.gif`);
        $("#activities button").prop("disabled", true);
        disabledButtons = true;
        setTimeoutWithDisabledButtons(() => {
            greeting.text(getGreeting(gameState.time, gameState.eat, gameState.sleep, gameState.play, gameState.med));
            $("#petImage").attr("src", `resources/${gameState.avatar}/level${gameState.level}/idle.gif`);
            $("#petImage").removeClass("pet-heal");
            $("#onActivity").attr("src", "");
        }, 3000);
    });

    // Let pet react when clicked on
    $("#petImage").click(() => {
        if (gameState.level == 3 && gameState.avatar == "avatar1") $("#petImage").addClass("m-5");
        $("#petImage").attr("src", `resources/${gameState.avatar}/level${gameState.level}/react.gif`);
        setTimeout(() => {
            $("#petImage").attr("src", `resources/${gameState.avatar}/level${gameState.level}/idle.gif`);
            $("#petImage").removeClass("m-5");
        }, 1200);
    });
}

// DOM Ready
$(document).ready(() => {
    // localStorage.clear();
    // Load based on local storage content
    var div = $(`#${restartOrContinue()}`);
    setWindowStart();

    // If new game, player's name and selected avatar on submission
    var playButton = $("#playButton");
    playButton.click(() => {
        // Get player pet name without whitespaces on both ends
        var name = $("#inputName").val().trim();

        // Ensure valid name and add proper alerts
        if (!validateName(name)) return;

        // Save game data to local storage
        localStorage.setItem("gameState", JSON.stringify({
            name: name.toUpperCase(),
            avatar: $(".carousel-item.active").find("img").data("avatar"),
            level: 1,
            eat: 50,
            sleep: 50,
            play: 50,
            med: 50,
            time: new Date(),
            timer: 0,
            realTime: new Date(),
            eatCounter: 0,
            eatTimer: 0,
            sleepCounter: 0,
            sleepTimer: 0,
            playCounter: 0,
            playTimer: 0,
            medCounter: 0,
            medTimer: 0
        }));

        // Hide #new and show #main
        div.hide();
        div = $("#main");
        div.show();
        loadMain();
        setWindowStart();
    });

    // Load game data from local storage if existing game
    if (div.attr("id") == "main") loadMain();

    // Resize window margin everytime window is resized
    $(window).resize(() => {
        setWindowStart();
    });

});

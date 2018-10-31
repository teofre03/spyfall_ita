    function afterLoadCsv(){
        // Imposta il numero di giocatori ed il tempo del turno in base ai parametri
        var query = location.search.replace('?', '');
        if(query != ""){
            var params = parse_query_string(query);
            if(params["players"] !== undefined){
                players = parseInt(params["players"]);
            }
            if(params["time"] !== undefined){
                roundTime = parseInt(params["time"]);
            }
        }
        // Mischia le carte e sceglie la prima
        cards = shuffle(cards);
        if(players*5 < cards.length){
            cards = cards.slice(0,players*5);
        }
        remainingCards = cards.slice();
        setRoundInfo();
    }

    // Mischia l'array passato come parametro
    function shuffle(array) {
      var currentIndex = array.length, temporaryValue, randomIndex;
      while (0 !== currentIndex) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
      }
      return array;
    }

    // Cambia la carta con la descrizione del round corrente
    function setRoundInfo(){
        $('#title').text("MONIKERS");
        $('#description').html(roundInfo[round-1]);
        $('#points').text("0");
    }

    // Cambia il giocatore
    function changePlayer(){
        if(currentPlayer == 0){
            currentPlayer = 1;
        } else {
            currentPlayer = 0;
        }
    }

    // Forza lo stop della progressbar
    function stopProgress(){
        stop = true;
        // Nasconde la progressbar e il suo contenitore
        $('#progressBar').hide();
        $('#startContainer').hide();
    }

    // Cambia la carta mostrata con quella successiva
    function change(){
        currentCardIndex++;
        if(remainingCards.length == 0){
            // Se le carte sono finite stoppo il timer e mostra i punteggi delle squadre
            $('#title').text("FINE ROUND");
            $('#description').html("<div style=\"text-align:center\"><b>PUNTEGGIO SQUADRE:</b><br>Squadra 1: " + points[0] + "<br>Squadra 2: " + points[1] + "</div>");
            $('#points').text("0");
            $('#skipButton').hide();
            $('#correctButton').hide();
            $('#points-box').css("background-color", "#15ace5");
            stopProgress();
        } else if(currentCardIndex >= remainingCards.length){
            // Se le carte sono finite ma ne sono state passate alcune mostra il punteggio del giocatore
            $('#title').text("FINE TURNO");
            $('#description').html("<div style=\"text-align:center\"><br>Hai totalizzato " + (playerPoints) + " punti!" + "</div>");
            $('#points').text("0");
            $('#skipButton').hide();
            $('#correctButton').hide();
            $('#points-box').css("background-color", "#15ace5");
            stopProgress();
        } else {
            // Recupera la carta successiva e la mostra
            var currentCard = remainingCards[currentCardIndex];
            $('#title').text(currentCard[0]);
            $('#description').text(currentCard[1]);
            $('#points').text(currentCard[2]);
            $('#points-box').css("background-color", getColor(parseInt(currentCard[2])));
        }
    }

    // Restituisce il colore della carta in base al punteggio (da 1 a 4)
    function getColor(points){
        switch (points) {
          case 1:
            return "#54b899";
            break;
          case 2:
            return "#15ace5";
            break;
          case 3:
            return "#8f66a5";
            break;
          case 4:
            return "#e84735";
            break;
          default:
            return "#15ace5";
        }
    }

    // Rimuove la carta dal mazzo, aggiorna il punteggio della squadra e quello del giocatore corrente
    // Infine cambia la carta con quella successiva
    function correct(){
        var currentCard = remainingCards[currentCardIndex];
        var currentPoints = points[currentPlayer];
        points[currentPlayer] = currentPoints + parseInt(currentCard[2]);
        playerPoints = playerPoints + parseInt(currentCard[2]);
        remainingCards.splice(currentCardIndex, 1);
        currentCardIndex--;
        change();
    }

    // Avvia il turno
    function start(){
        if(!playing){
            playing = true;
            currentCardIndex = -1;
            playerPoints = 0;
            stop = false;
            // Mischia le carte rimaste e sceglie la prima
            remainingCards = shuffle(remainingCards);
            // Fa partire il timer e mostra la prima carta
            startTimer(roundTime);
            change();
        }
    }

    // Gestione del tempo
    function startTimer(time){
        document.getElementById("progressBar").value = 0;
        $('#start').hide();
        $('.button').css("height", "10");
        $('#progressBar').show();
        $('#progressBar').attr("max", time);
        $('#skipButton').css('display', 'inline-block');
        $('#correctButton').css('display', 'inline-block');
        var timeleft = time;
        var downloadTimer = setInterval(function(){
          document.getElementById("progressBar").value = time - --timeleft;
          if(timeleft <= 0 || stop){
            $('#startContainer').hide();
            var audio = new Audio('buzz.mp3');
            audio.play();
            changePlayer();
            $('#progressBar').hide();
            $('#skipButton').hide();
            $('#correctButton').hide();
            clearInterval(downloadTimer);
            var waitTime = 5000;
            if(remainingCards.length != 0){
                $('#title').text("FINE TURNO");
                $('#description').html("<div style=\"text-align:center\"><br>Hai totalizzato " + (playerPoints) + " punti!" + "</div>");
                $('#points').text("0");
                $('#skipButton').hide();
                $('#correctButton').hide();
                $('#points-box').css("background-color", "#15ace5");
            } else {
                $('#points').text("0");
                $('#skipButton').hide();
                $('#correctButton').hide();
                $('#points-box').css("background-color", "#15ace5");
                if(round < 3){
                    $('#title').text("FINE ROUND");
                    $('#description').html("<div style=\"text-align:center\"><b>PUNTEGGIO SQUADRE:</b><br>Squadra 1: " + points[0] + "<br>Squadra 2: " + points[1] + "</div>");
                    round++;
                    remainingCards = cards.slice();
                    waitTime = 10000;
                } else {
                    $('#title').text("FINE PARTITA");
                    var winner = 1;
                    if(points[0] < points[1]){
                        winner = 2;
                    }
                    if(points[0] != points[1]){
                        $('#description').html("<div style=\"text-align:center\"><b>PUNTEGGIO SQUADRE:</b><br>Squadra 1: " + points[0] + "<br>Squadra 2: " + points[1] + "<br><br>Vince la squadra <b>" + winner + "</b>!</div>");
                    } else{
                        $('#description').html("<div style=\"text-align:center\"><b>PUNTEGGIO SQUADRE:</b><br>Squadra 1: " + points[0] + "<br>Squadra 2: " + points[1] + "<br><br><b>Pareggio!</b></div>");
                    }
                    waitTime = 60000;
                    setTimeout(function() {
                        location.reload();
                    }, waitTime);
                }
            }
            setTimeout(function() {
                setRoundInfo();
                playing = false;
                $('.button').css("height", "50");
                $('#start').show();
                $('#startContainer').show();
            }, waitTime);
          }
        },1000);
    }

    function parse_query_string(query) {
      var vars = query.split("&");
      var query_string = {};
      for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        var key = decodeURIComponent(pair[0]);
        var value = decodeURIComponent(pair[1]);
        // If first entry with this name
        if (typeof query_string[key] === "undefined") {
          query_string[key] = decodeURIComponent(value);
          // If second entry with this name
        } else if (typeof query_string[key] === "string") {
          var arr = [query_string[key], decodeURIComponent(value)];
          query_string[key] = arr;
          // If third or later entry with this name
        } else {
          query_string[key].push(decodeURIComponent(value));
        }
      }
      return query_string;
    }

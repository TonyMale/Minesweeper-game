import $ from 'jquery';

export const Minesweeper = (function () {
    let $game = $('#game'),
        instance,
        game,        
        cells,
        timer, 
        _isLeftMouseDown,
        _isRightMouseDown,
        _isFaceButtonDown,
        lag; //задаржка при вызове обработчиков события
    
    const initGame =  function(param){
        let width = (param.width > 8) ? param.width : 8,
            height = param.height,
            minesCount = (param.minesCount < height * width)
                        ? param.minesCount
                        : height * width - 1,
            clearCellsCount = width * height - minesCount;
        game = {
            start: false,
            gameover: false,
            gamewin: false,
            width: width,
            height: height,
            minesCount: minesCount,
            flagMinesCount: minesCount,
            clearCellsCount: clearCellsCount,
            seconds: 1
        }; 
        reset();                                           
        createGame();
        $game.contextmenu(()=>false);
        $game.on('mousedown', mousedownHandle);
        $game.on('mouseup', mouseupHandle);
        $game.on('mouseover', mouseMoveHandle);
        $game.on('mouseout', mouseMoveHandle);
    }
    const reset = function(){
        $game.off('mousedown');
        $game.off('mouseup');
        $game.off('mouseover');
        $game.off('mouseout');       
        $game.empty();

        cells=[];
        _isLeftMouseDown = false;
        _isRightMouseDown = false;
        _isFaceButtonDown = false;
        
        if(timer){
            clearInterval(timer);
        }  
    }        
    const startGame = function(id){
        game.start = true;
        createMines(id);
        countMinesAround();
        if(game.clearCellsCount > 2){
            openEmptyCell(id);
        }
        else{
            openOneCell(id);
        }
        updatePanel(game.seconds, "seconds");
        timer = setInterval(addSecond, 1000);
    }
    const createGame = function(){        
        $game.width(()=> game.width * 16 + 20);
        $game.height(()=> game.height * 16 + 62);
        let str='';
        function createBord(){       
            for(let j = 0; j < game.width; j++){
                str += `<div class="bordertb"></div>`;
            }    
        }
        const createCell = function(){       
            let arr=[],
                id;
            str += `<div class="bordertl"></div>`;    
            createBord();
            str += `<div class="bordertr"></div>`;
            str += `<div class="borderlrlong"></div>
                    <div class="time0" id="mines_hundreds"></div>
                    <div class="time0" id="mines_tens"></div>
                    <div class="time0" id="mines_ones"></div>
                    <div class="facesmile" id="face" style="margin-left: ${6 + (game.width-8)*8}px; margin-right: ${6 + (game.width-8)*8}px;" id="face"></div>
                    <div class="time0" id="seconds_hundreds"></div>
                    <div class="time0" id="seconds_tens"></div>
                    <div class="time0" id="seconds_ones"></div>
                    <div class="borderlrlong"></div>
                    <div class="borderjointl"></div>`;
            createBord();
            str += `<div class="borderjointr"></div>`;
            for(let i = 0; i < game.height; i++){
                str += `<div class="borderlr"></div>`;
                for(let j = 0; j < game.width; j++){
                    id = `${i}_${j}`;
                    arr.push({
                        id: id,
                        flag: false,
                        question: false,
                        hasMine: false,
                        opened: false,
                        countMinesAround: 0
                    }); 
                    str+= `<div class="cell close" id="${id}"></div>`;
                }
                str += `<div class="borderlr"></div>`;
                cells.push(arr);
                arr=[];                
            }
            str += `<div class="borderbl"></div>`;    
            createBord();
            str += `<div class="borderbr"></div>`;
            return str;
        }
        $game.append(createCell);
        updatePanel(game.flagMinesCount, "mines");            
    }

    const getCellEnviroment = function(id){
        let arrIndex = id.split("_"),
            indexX = +arrIndex[0],
            indexY = +arrIndex[1],
            arrEnviroment = [];
        for(let i = (indexX > 0) ? indexX-1 : 0, maxX = (indexX == game.height-1) ? indexX : indexX + 1;
            i <= maxX; i++){
            for(let j = (indexY > 0) ? indexY-1 : 0, maxY = (indexY == game.width-1) ? indexY : indexY + 1;
                j <= maxY; j++){
                if((i!==indexX || j!==indexY) && cells[i][j])
                    arrEnviroment.push(cells[i][j]);
            }
        }
        return arrEnviroment;
    }
        
    const addSecond = function (){
        game.seconds++;
        updatePanel(game.seconds, "seconds");
    }
    const getRandomInt = function (max) {
        return Math.floor(Math.random() * max);
    }

    const createMine = function (id, arr){
        let x = getRandomInt(game.height);
        let y = getRandomInt(game.width);
        if(cells[x][y].hasMine || (arr.indexOf(cells[x][y]) != -1 && game.clearCellsCount > 3) || cells[x][y].id == id){
            createMine(id, arr);
        } 
        else{
            cells[x][y].hasMine= true;
        }                   
    }
    const createMines = function (id){
        let minesCount = game.minesCount;        
        let arrCellsOpenStart = getCellEnviroment(id);
        while (minesCount > 0){
            createMine(id, arrCellsOpenStart);  
            minesCount--;
        }
    }
    const clickCell = function($target){
        let cell = getCellById($target.id);                     
        if(!lag){
            lag = setTimeout(function(cell){                
                if(_isLeftMouseDown && !_isRightMouseDown){
                    toggleFace();
                    if(!cell.flag && !cell.opened){
                        toggleCell(cell);
                    } 
                }
                else if(_isRightMouseDown && !cell.opened){
                    toggleFlag(cell);
                    toggleFace();
                }
                _isRightMouseDown=false;
                lag = null;
            }.bind(this, cell), 100)
        }
        else{
            clearTimeout(lag);
            lag = null;                        
            if(_isLeftMouseDown && _isRightMouseDown){
                toggleCellEnviroment(cell);
                toggleFace();
            }
        }
    }

    const openEmptyCell = function (id){
        const arrIdOpenCells = getIdOpenCells(id);        
        for(let i=0; i< arrIdOpenCells.length; i++){
            let openCell = getCellById(arrIdOpenCells[i]);
            $("#" + openCell.id).removeClass().addClass("cell open" + openCell.countMinesAround);
            openCell.opened = true;
            game.clearCellsCount--;
        } 
    }
    const openOneCell = function(id){
        let cell = getCellById(id);
        $("#" + id).removeClass().addClass("cell open" + cell.countMinesAround);
        cell.opened = true;
        game.clearCellsCount--;
    }
    const openCell = function($target){
        let id = $target.id;
        let cell = getCellById(id);         
        if(!game.start && !game.over && !cell.flag){
            startGame(id);                   
        }
        else if(!cell.hasMine && !cell.opened && !cell.flag && cell.countMinesAround == 0){
            openEmptyCell(id);
        }
        else if(!cell.hasMine && !cell.opened && cell.countMinesAround > 0 && !cell.flag){
            openOneCell(id);
        }           
        else if (cell.hasMine && !cell.flag){
            $("#" + cell.id).removeClass().addClass("cell bombactive");
            cell.opened = true;
            gameover();
        }
        if(game.clearCellsCount === 0){               
            gamewin();
        }            
    }

    const mouseupHandle = function (event){
        let $target = event.target;
        let cell;
        if(!$target.id || ($target.className.indexOf("cell") == -1 && $target.id !== "face")){
            _isLeftMouseDown = false;
            _isRightMouseDown = false;
            _isFaceButtonDown = false;
            toggleFace();
            return
        }
        if(_isFaceButtonDown && _isLeftMouseDown){
            _isFaceButtonDown = false;
            _isLeftMouseDown = false;
            toggleFace();
            initGame({width: game.width, height: game.height, minesCount: game.minesCount});
        }
        else if(!game.gameover && !game.gamewin){
            if(_isLeftMouseDown && !_isRightMouseDown){
                openCell($target);
                _isLeftMouseDown = false;
                toggleFace();
            }
            else if(_isLeftMouseDown && _isRightMouseDown){
                cell = getCellById($target.id);
                toggleCellEnviroment(cell);                 
                _isLeftMouseDown = false;
                _isRightMouseDown = false;
                toggleFace();                
            }
        }                                  
    }
    const mousedownHandle = function (event){
        event = event || window.event;
        let $target = event.target;
        let isRightMB;
        let isLeftMB;
        
        if ("which" in event){
            isRightMB = event.which == 3;
            isLeftMB = event.which == 1;
        }    
        else if ("button" in event){
            isRightMB = e.button == 2;
            isLeftMB = e.button == 0;
        }             
        if(isLeftMB){
            _isLeftMouseDown = true;
        }
        else if(isRightMB){
            _isRightMouseDown = true;
        }   
        if(!$target.id){
            return
        }
        else if($target.id === "face"){
            _isFaceButtonDown = true;
            toggleFace();
        }
        else if(!game.gameover && !game.gamewin){
            clickCell($target);
        }           
    }

    const mouseMoveHandle = function(event){
        let $target = event.target;
        if((!_isLeftMouseDown && !_isRightMouseDown) || !$target.id || $target.className.indexOf("cell") === -1){                
            toggleFace();
            return;
        }            
        let cell = getCellById($target.id);            
        if(_isLeftMouseDown && !_isRightMouseDown && !cell.flag && !cell.opened){
            toggleCell(cell);
        }
        else if(_isRightMouseDown && _isLeftMouseDown){
            toggleCellEnviroment(cell);
        }
    }

    const toggleCellEnviroment = function ($target){
        let cellEnviroment = getCellEnviroment($target.id);
        cellEnviroment.push(getCellById($target.id));
        for(let i=0; i < cellEnviroment.length; i++){
            if(!cellEnviroment[i].opened && !cellEnviroment[i].flag){
                toggleCell(cellEnviroment[i]);
            }            
        }
    }
    const toggleCell = function (cell){
        if($("#" + cell.id).hasClass("close")){
            $("#" + cell.id).removeClass("close").addClass("open0");
        }
        else{
            $("#" + cell.id).removeClass("open0").addClass("close");
        }            
    }
    const toggleFace = function (){
        if(game.gameover){
            $("#face").removeClass().addClass("facedead");
        }
        else if(game.gamewin){
            $("#face").removeClass().addClass("facewin");
        }
        else if(_isLeftMouseDown && !_isFaceButtonDown){
            $("#face").removeClass().addClass("faceohh");
        }
        else if(_isFaceButtonDown && !_isRightMouseDown){
            $("#face").removeClass().addClass("facepressed");
        }
        else{
            $("#face").removeClass().addClass("facesmile");
        }
    }
    const toggleFlag = function (cell){
        if(!cell.flag && !cell.question){
            cell.flag = true;
            game.flagMinesCount--;
            $("#" + cell.id).removeClass("close").addClass("bombflagged");
            updatePanel(game.flagMinesCount, "mines")
        }
        else if(cell.flag && !cell.question){
            cell.flag = false;
            cell.question = true;
            game.flagMinesCount++;
            $("#" + cell.id).removeClass("bombflagged").addClass("question");
            updatePanel(game.flagMinesCount, "mines")
        }
        else{
            cell.question = false;
            $("#" + cell.id).removeClass("question").addClass("close");
        }
    }
    
    const getCellById = function(id){
        let arrIndex = id.split("_");
        return cells[arrIndex[0]][arrIndex[1]];
    }

    const getIdOpenCells = function (id){
        let arrOpenCells = [id];
        getIdOpenCell(id);
        function getIdOpenCell(id){
            let arrTemp = getCellEnviroment(id);
            for(let i=0; i< arrTemp.length; i++){
                if(arrOpenCells.indexOf(arrTemp[i].id) !== -1 || arrTemp.hasMine || arrTemp[i].flag || arrTemp[i].opened)
                    continue;
                else if(arrTemp[i].countMinesAround > 0){
                    arrOpenCells.push(arrTemp[i].id);
                }                    
                else if(arrTemp[i].countMinesAround == 0){
                    arrOpenCells.push(arrTemp[i].id);
                    getIdOpenCell(arrTemp[i].id);
                }
            }
            return
        }
        return arrOpenCells;             
    }
    const countMinesAround = function (){
        for(let i = 0; i < game.height; i++){
            for(let j = 0; j < game.width; j++){
                if(!cells[i][j].hasMine){
                    let arrCellsEnviroment = getCellEnviroment(cells[i][j].id);
                    for(let k=0; k < arrCellsEnviroment.length; k++){
                        arrCellsEnviroment[k].hasMine ? cells[i][j].countMinesAround++ : '';
                    }
                }
            }
        }   
    }

    const updatePanel = function (num, temp){
        if(num.length > 3){
            return
        }
        let [ones=0, tens=0, hundreds = 0] = num.toString().split('').reverse();
        [tens, hundreds]= tens === '-' ? ['0','-'] : [tens,hundreds];
        if(!$("#"+temp+"_ones").hasClass("time" + ones)){
            $("#"+temp+"_ones").removeClass().addClass("time" + ones);
        }
        if(!$("#"+temp+"_tens").hasClass("time" + tens)){
            $("#"+temp+"_tens").removeClass().addClass("time" + tens);
        } 
        if(!$("#"+temp+"_hundreds").hasClass("time" + hundreds)){
            $("#"+temp+"_hundreds").removeClass().addClass("time" + hundreds);
        }
        return             
    }

    const gameover = function(){
        for(let i = 0; i < game.height; i++){
            for(let j = 0; j < game.width; j++){
                if(cells[i][j].hasMine && !cells[i][j].opened && !cells[i][j].flag){
                    $("#" + cells[i][j].id).removeClass("close").addClass("bomb");
                }
                else if(!cells[i][j].hasMine && !cells[i][j].opened && cells[i][j].flag){
                    $("#" + cells[i][j].id).removeClass("bombflagged").addClass("bombmissflagged");
                }              
            }
        }
        game.gameover=true;
        clearInterval(timer);
    }
    const gamewin = function (){
        for(let i = 0; i < game.height; i++){
            for(let j = 0; j < game.width; j++){
                if(cells[i][j].hasMine && !cells[i][j].flag){
                    toggleFlag(cells[i][j]);
                }              
            }
        }
        game.gamewin = true;
        clearInterval(timer);
    }
        
    const createInstance = function () {
      return {
        initGame: function(param){
            initGame(param);
        },
        getStateGame: function(){
            return game;
        }
      }
    }  
    return {
      getInstance: function () {
        return instance || (instance = createInstance());
      }
    }
  })();
import $ from 'jquery';
import {Minesweeper} from './minesweeper.js'


$(document).ready(function(){   
    const gameParameters = {
        beginner: {width: 9, height: 9, minesCount: 10},
        intermediate: {width: 16, height: 16, minesCount: 40},
        expert: {width: 30, height: 16, minesCount: 99},
    }

    Minesweeper.getInstance().initGame(gameParameters.expert);
    $("#option-close").click(function(){
        $("#options-form").css("display", "none");
    })
    $("#drop-menu").click(function(){
        $("#options-form").toggle();
    });
    $("#options-form").submit(function(event){
        event.preventDefault();
        $("#options-form").css("display", "none");
        let radioValue = $('input[name="field"]:checked', '#options-form').val()
        switch (radioValue){
            case 'beginner':
                Minesweeper.getInstance().initGame(gameParameters.beginner);
                break;
            case 'intermediate':
                MMinesweeper.getInstance().initGame(gameParameters.intermediate);
                break;
            case 'expert':
                Minesweeper.getInstance().initGame(gameParameters.expert);
                break;
            case 'special':
                let width = $("#custom_width").val();
                let height = $("#custom_height").val();
                let mines = $("#custom_mines").val();
                Minesweeper.getInstance().initGame({width: width, height: height, minesCount: mines});
                $("#custom_width").val(Minesweeper.getInstance().getStateGame().width);
                $("#custom_height").val(Minesweeper.getInstance().getStateGame().height);
                $("#custom_mines").val(Minesweeper.getInstance().getStateGame().minesCount);
                break;
        }
            
    })
});
    
import './main.scss';

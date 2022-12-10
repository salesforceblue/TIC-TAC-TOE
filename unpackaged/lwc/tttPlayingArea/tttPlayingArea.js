import { LightningElement, api } from 'lwc';
import { subscribe,unsubscribe, onError} from 'lightning/empApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import publishMove from '@salesforce/apex/TTT_PlayingAreaController.publishMove';
export default class TttPlayingArea extends LightningElement {
    @api loggedInUserId;
    @api playingWithUserId;
    @api gameId;
    @api playingAs;
    MOVE_X = 'X';
    MOVE_O = 'O';
    canMove = false; 
    gameState;
    channelName = '/event/TTT_Game_Moves__e';
    subscribed;
    isLoggedInUserWon = false;
    isPlayingWithWon = false;
    isGameSet = false;

    movesData = {
        tileZero    : '',
        tileOne     : '',
        tileTwo     : '',
        tileThree   : '',
        tileFour    : '',
        tileFive    : '',
        tileSix     : '',
        tileSeven   : '',
        tileEight   : ''
    };

    connectedCallback() {
        this.registerErrorListener();
        if(!this.subscribed) this.handleSubscribe();
        this.canMove = this.playingAs === this.MOVE_X ? true : false; 
    }

    /* @Desc: handler for click on the board tile */
    handleTileClick(event) {
        if(!this.canMove || this.isGameSet || event.target.innerText) return;
        event.target.innerText = this.playingAs;
        this.movesData[event.target.dataset.tileid] = this.playingAs;
        this.publishMoveOnBoard();
    }

    /* @Desc: This will read the current moves so that it can be published */
    publishMoveOnBoard() {
        publishMove({movesData: this.movesData, gameId: this.gameId, gameState: this.gameState}).then((data) => {
            console.log('moves published');
        })
        .catch((error) => {
            console.log('error occured while publishing moves');
        })
    }

    /* @Desc: This will set the moves post reading it from callback function of Platform event subscription */
    setMovesOnBoard(boardPosition) {
        for(let item of Object.keys(boardPosition)) {
            this.template.querySelector("[data-tileid='"+item+"']").innerText = boardPosition[item];
        }

        this.movesData = boardPosition;
    }

    /* @Desc: Check game current status based on current move taken */
    evaluateGameState(boardPosition, state) {
        if(state === 'X_WIN') {
            this.dispatchEvent(new ShowToastEvent({
                title: 'Game Won',
                message: 'X has Won',
                variant: 'success'
            }));

            if(this.playingAs === this.MOVE_X) {
                this.isLoggedInUserWon = true;
                this.isPlayingWithWon = false;
            } else {
                this.isLoggedInUserWon = false;
                this.isPlayingWithWon = true;
            }

            this.handleUnsubscribe();
            this.isGameSet = true;
            return;
        } else if (state === 'O_WIN') {
            this.dispatchEvent(new ShowToastEvent({
                title: 'Game Won',
                message: 'O has Won',
                variant: 'success'
            }));
            
            if(this.playingAs === this.MOVE_O) {
                this.isLoggedInUserWon = true;
                this.isPlayingWithWon = false;
            } else {
                this.isLoggedInUserWon = false;
                this.isPlayingWithWon = true;
            }
            
            this.handleUnsubscribe();
            this.isGameSet = true;
            return;
        } else if (state === 'DRAW') {
            this.dispatchEvent(new ShowToastEvent({
                title: 'Game Draw',
                message: 'Its a draw',
                variant: 'success'
            }));
            this.handleUnsubscribe();
            this.isGameSet = true;
            return;
        }

        let X_Moves = [];
        let O_Moves = [];

        let WINNING_COUNT = 3;

        let isGameClose = false;
        let xYMatrix = {
            'tileZero' : {
                x: 0, y: 0
            },
            'tileOne' : {
                x: 0, y: 1
            },
            'tileTwo' : {
                x: 0, y: 2
            },
            'tileThree' : {
                x: 1, y: 0
            },
            'tileFour' : {
                x: 1, y: 1
            },
            'tileFive' : {
                x: 1, y: 2
            },
            'tileSix' : {
                x: 2, y: 0
            },
            'tileSeven' : {
                x: 2, y: 1
            },
            'tileEight' : {
                x: 2, y: 2
            }
        }

        let boardStateMatrix = [[],[],[]];

        for(let item of Object.keys(boardPosition)) {
            let currentMove = boardPosition[item];
            let i = xYMatrix[item].x;
            let j = xYMatrix[item].y;
            boardStateMatrix[i][j] = currentMove;
        }
        // Scanning Row Wise, Column Wise & Diagonal Wise for game results:
        // Row Wise Scan
        for(let i = 0; i < 3; i++) {
            for(let j = 0; j < 3; j++) {
                if(boardStateMatrix[i][j] === this.MOVE_X) {
                    X_Moves.push('X');
                    O_Moves.length = 0; // clearing Y
                }

                if(boardStateMatrix[i][j] === this.MOVE_O) {
                    O_Moves.push('O');
                    X_Moves.length = 0; // clearing X
                }
            }
            
            this.scanTupple(X_Moves, WINNING_COUNT, O_Moves);
            this.validateAndPublishGameResults();
            if(this.gameState) return;
        }

        X_Moves.length = 0; // Resetting for column scan
        O_Moves.length = 0;
    
        // Col Wise Scan
        for(let i = 0; i < 3; i++) {
            for(let j = 0; j < 3; j++) {
                if(boardStateMatrix[j][i] === this.MOVE_X) {
                    X_Moves.push('X');
                    O_Moves.length = 0; // clearing Y
                }

                if(boardStateMatrix[j][i] === this.MOVE_O) {
                    O_Moves.push('O');
                    X_Moves.length = 0; // clearing X
                }
            }
            
            this.scanTupple(X_Moves, WINNING_COUNT, O_Moves);
            this.validateAndPublishGameResults();
            if(this.gameState) return;
        }
       
        X_Moves.length = 0; // Resetting for Diagonal scan
        O_Moves.length = 0;

        // scanning diagonal wise R-L;
        let j = 2;
        for(let i = 0; i < 3; i++) {
            if(boardStateMatrix[i][j] === this.MOVE_X) {
                X_Moves.push('X');
                O_Moves.length = 0; // clearing Y
            }

            if(boardStateMatrix[i][j] === this.MOVE_O) {
                O_Moves.push('O');
                X_Moves.length = 0; // clearing X
            }

            j--;
        }

        this.scanTupple(X_Moves, WINNING_COUNT, O_Moves);
        this.validateAndPublishGameResults();
        if(this.gameState) return;

        // scanning diagonal wise L-R;
        j = 0;
        for(let i = 0; i < 3; i++) { 
            if(boardStateMatrix[i][j] === this.MOVE_X) {
                X_Moves.push('X');
                O_Moves.length = 0; // clearing Y
            }

            if(boardStateMatrix[i][j] === this.MOVE_O) {
                O_Moves.push('O');
                X_Moves.length = 0; // clearing X
            }
            
            j++;
        }

        this.scanTupple(X_Moves, WINNING_COUNT, O_Moves);
        this.validateAndPublishGameResults();
        if(this.gameState) return;

        // Draw Scan
        for(let i = 0; i < 3; i++) {
            for(let j = 2; j >= 0; j--) {
                if(boardStateMatrix[i][j] === this.MOVE_X) {
                    X_Moves.push('X');
                }

                if(boardStateMatrix[i][j] === this.MOVE_O) {
                    O_Moves.push('O');
                }
            }
        }

        if(X_Moves.length + O_Moves.length === 9) {
            this.gameState = 'DRAW';
            this.validateAndPublishGameResults();
        }
        
    }

    /* @Desc: This will validate game state and publish the result respectively */
    validateAndPublishGameResults() {
        if (this.gameState === 'X_WIN' || this.gameState === 'O_WIN' || this.gameState === 'DRAW') {
            this.publishMoveOnBoard();
        }
    }

    /* @Desc: This will evaluate the individual tupple for winning moves */
    scanTupple(X_Moves, WINNING_COUNT, O_Moves) {
        if (X_Moves.length === WINNING_COUNT) {
            this.gameState = 'X_WIN';
        } else if (O_Moves.length === WINNING_COUNT) {
            this.gameState = 'O_WIN';
        }

        X_Moves.length = 0; // resetting for a fresh scan of next row
        O_Moves.length = 0;
    }

    /* @Desc: handler for subscribing to game move platform event */
    handleSubscribe() {
        const messageCallback = (response) => {
            let boardPositionsMap = JSON.parse(response.data.payload.TTT_Board_Positions__c);
            if(!boardPositionsMap[this.gameId]) return;
            let state = boardPositionsMap[this.gameId].State;
            let boardPosition = boardPositionsMap[this.gameId].Moves;
            this.setMovesOnBoard(boardPosition);
            this.evaluateGameState(boardPosition, state);
            this.canMove = !this.canMove;  
        };

        subscribe(this.channelName, -1, messageCallback).then((response) => {
            this.subscription = response;
        });

        this.subscribed = true;
    }

    /* @Desc: handler for unsubscribe to game move platform event */
    handleUnsubscribe() {
        unsubscribe(this.subscription, (response) => {
            console.log('unsubscribe() response: ', JSON.stringify(response));
        });
    }

    /* @Desc: Listener for error event. */
    registerErrorListener() {
        onError((error) => {
            console.log('Received error from server: ', JSON.stringify(error));
        });
    }
   
}
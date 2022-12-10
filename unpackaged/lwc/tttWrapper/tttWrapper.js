import { LightningElement } from 'lwc';

export default class TttWrapper extends LightningElement {
    isGameOn = false;
    playingWithUserId;
    loggedInPlayerId;
    playingAs;
    gameId;
    
    handleStartGame(event) {
        this.isGameOn = true;
        this.playingWithUserId = event.detail.PlayingWithId;
        this.loggedInPlayerId = event.detail.LoggedInUserId;
        this.playingAs = event.detail.PlayingAs;
        this.gameId = event.detail.GameId;
    }
}
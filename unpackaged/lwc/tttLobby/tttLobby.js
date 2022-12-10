import { LightningElement } from 'lwc';
import { createRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { subscribe,unsubscribe, onError} from 'lightning/empApi';
import TTT_GAME_LOBBY_OBJECT from '@salesforce/schema/TTT_Game_Lobby__c';
import TTT_PLAYER_FIELD from '@salesforce/schema/TTT_Game_Lobby__c.TTT_Player__c';
import Id from '@salesforce/user/Id';


// lobby should listen for game start platform event 

// once the message is received inform the parent to send the players to the playing area

// as the game has already started so we are good with the subscribed pe and should be declared done.

export default class TttLobby extends LightningElement {
    userId = Id;
    isPlayerAddedToLobby = false;
    lobbyId;
    subscribed;
    subscription = {};
    channelName = '/event/TTT_Game_Start__e';

    connectedCallback() {
        this.registerErrorListener();
        if(!this.subscribed) this.handleSubscribe();
        if(!this.isPlayerAddedToLobby) this.addPlayerToLobby();
    }

    /* @Desc: Add logged in player to lobby */
    addPlayerToLobby() {
        const fields = {};
        fields[TTT_PLAYER_FIELD.fieldApiName] = this.userId;
        const recordInput = { apiName: TTT_GAME_LOBBY_OBJECT.objectApiName, fields };
        createRecord(recordInput)
            .then((lobby) => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Added to lobby',
                        variant: 'success',
                    }),
                );

                // this.lobbyId = lobby.Id;
                this.isPlayerAddedToLobby = true;
                this.lobbyId = lobby.id;
            })
            .catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error Adding to lobby',
                        message: error.body.message,
                        variant: 'error',
                    }),
                );
            });
    }
    
    handleSubscribe() {
        // Callback invoked whenever a new event message is received
        const messageCallback = (response) => {
            console.log('New message received: ', JSON.stringify(response));
            let gameInfo = JSON.parse(response.data.payload.TTT_Game_Info__c);
            let playerUniqueId = this.lobbyId + '__' + this.userId;
            let {PlayingWith, GameId, PlayingAs} = gameInfo[playerUniqueId];
            console.log(`playingas ::: ${PlayingAs}`);
            this.startGame(PlayingWith, this.userId, GameId, PlayingAs);
        };

        // Invoke subscribe method of empApi. Pass reference to messageCallback
        subscribe(this.channelName, -1, messageCallback).then((response) => {
            // Response contains the subscription information on subscribe call
            console.log(
                'Subscription request sent to: ',
                JSON.stringify(response.channel)
            );
            this.subscription = response;
        });

        this.subscribed = true;
    }

    handleUnsubscribe() {
        // Invoke unsubscribe method of empApi
        unsubscribe(this.subscription, (response) => {
            console.log('unsubscribe() response: ', JSON.stringify(response));
            // Response is true for successful unsubscribe
        });
    }

    registerErrorListener() {
        // Invoke onError empApi method
        onError((error) => {
            console.log('Received error from server: ', JSON.stringify(error));
            // Error contains the server-side error
        });
    }

    startGame(playingWithId, loggedInUserId, gameId, playingAs) {
        this.dispatchEvent(new CustomEvent('startgame', {
            detail: {
                'PlayingWithId': playingWithId,
                'LoggedInUserId': loggedInUserId,
                'PlayingAs': playingAs,
                'GameId': gameId
            }
        }));
    }
}
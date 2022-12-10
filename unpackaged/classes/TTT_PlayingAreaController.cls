/* 
@Author: Pankaj Agrahari 
@Email: salesforceblue@gmail.com 
@Desc: Controller class for tttPlayingArea lwc 
*/

public with sharing class TTT_PlayingAreaController {

    //@Desc: This will publish the gameMoves. Listening component will read this and will render the latest move on the board(lwc)
    @AuraEnabled    
    public static void publishMove(Object movesData, String gameId, String gameState) {
        // Do a publish call here
        Map<String, Map<String,Object>> mapOfGameIdToGameData = new Map<String, Map<String,Object>>();
        Map<String, Object> mapOfGameData = new Map<String, Object>();
        mapOfGameData.put('Moves', movesData);
        mapOfGameData.put('State', gameState);
        mapOfGameIdToGameData.put(gameId, mapOfGameData);

        Eventbus.publish(new TTT_Game_Moves__e(
            TTT_Board_Positions__c = JSON.serialize(mapOfGameIdToGameData)
        ));

        System.debug('moves published with payload ' + JSON.serialize(mapOfGameIdToGameData));
    }
}
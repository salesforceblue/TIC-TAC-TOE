/* 
@Author: Pankaj Agrahari 
@Email: salesforceblue@gmail.com 
@Desc: Service class for GameArea 
*/
public with sharing class TTT_GameAreaService {
  
    /* @Desc: scheduled for Game Area */
    public static void startGame(List<TTT_Game_Area__c> recordsList) {
        // This will fire a PE with players info to start the game, with game id
        String payload; 

        payload = TTT_GameAreaServiceHelper.preparePayload(recordsList);
        System.debug('payload >> ' + payload);
        TTT_GameAreaServiceHelper.publishCallToStartGame(payload);

    }

}
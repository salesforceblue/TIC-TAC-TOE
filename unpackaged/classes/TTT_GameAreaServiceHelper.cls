/* 
@Author: Pankaj Agrahari 
@Email: salesforceblue@gmail.com 
@Desc: Helper class for TTT_GameAreaService 
*/

public with sharing class TTT_GameAreaServiceHelper {
    
    /* @Desc:  This method will publish the required platform event to start the game */
    public static String preparePayload(List<TTT_Game_Area__c> recordsList) {
        Map<String, String> mapOfGameInfo = new Map<String,String>();
        Map<String, Map<String,String>> mapOfUserIdToGameInfo = new Map<String, Map<String, String>>();

        for(TTT_Game_Area__c currentGame : recordsList) {
            // @note: Storing info for player one
            mapOfGameInfo = new Map<String,String>();
            mapOfGameInfo.put('GameId', currentGame.Id);
            mapOfGameInfo.put('PlayingWith', currentGame.TTT_Player_Two__c);
            mapOfGameInfo.put('PlayingAs', 'X');
            mapOfUserIdToGameInfo.put(currentGame.TTT_Player_One_Id__c, mapOfGameInfo);

            // @note: Storing info for player two
            mapOfGameInfo = new Map<String,String>();
            mapOfGameInfo.put('GameId', currentGame.Id);
            mapOfGameInfo.put('PlayingWith', currentGame.TTT_Player_One__c);
            mapOfGameInfo.put('PlayingAs', 'O');
            mapOfUserIdToGameInfo.put(currentGame.TTT_Player_Two_Id__c, mapOfGameInfo);

        }

        return JSON.serialize(mapOfUserIdToGameInfo);
    }

    /* @Desc:  This method will publish the required platform event to start the game */
    public static void publishCallToStartGame(String payload) {
        Eventbus.publish(new TTT_Game_Start__e(
            TTT_Game_Info__c = payload
        ));
    }

}

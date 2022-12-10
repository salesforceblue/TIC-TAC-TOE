/* 
    @Author: Pankaj Agrahari 
    @Email: salesforceblue@gmail.com 
    @Desc: Service class for GameLobby 
*/
public with sharing class TTT_GameLobbyTriggerHandler {
    /* @Desc: After insert handler for TTT_GameLobbyTrigger */
    public static void afterInsert(List<TTT_Game_Lobby__c> recordsList, Map<ID, TTT_Game_Lobby__c> recordsMap) {
        TTT_GameLobbyService.scheduleGame(recordsList);
    }
    
}
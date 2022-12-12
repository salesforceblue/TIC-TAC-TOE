/* 
@Author: Pankaj Agrahari 
@Email: salesforceblue@gmail.com 
@Desc: Trigger Handler for TTT_Game_Area__c
*/
public with sharing class TTT_GameAreaTriggerHandler {
    /* @Desc: After insert handler*/
    public static void afterInsert(List<TTT_Game_Area__c> recordsList, Map<ID, TTT_Game_Area__c> recordsMap) {
        TTT_GameAreaService.startGame(recordsList);
    }
}

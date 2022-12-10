trigger TTT_GameAreaTrigger on TTT_Game_Area__c (after insert) {
    TTT_GameAreaTriggerHandler.afterInsert(Trigger.new, Trigger.newMap);
}
# Incident: 2024-11-26 12-30-00

## Summary

Pizzas were unable to be ordered through the factory between the hours of 12:30 and 2 on november 26 2024. The impact was very severe as we were unable to make any money while the issue persisted. It lasted about an hour and a half. This was caused because our factory api key was disabled around 12:30. The fix involved following the URL sent by the factory to reset the API key.

## Detection

When did the team detect the incident? How did they know it was happening? How could we improve time-to-detection? Consider: How would we have cut that time by half?

This incident was detected when the number of orders failed went from 0  to 1 this was noticed manually as I had not created an alert for the pizza factory. I responded immediately to work on solving the problem.

To improve in the future the alerts have been improved and alerts have been added for all key metrics including factory pizzas created.

## Impact

Describe how the incident impacted internal and external users during the incident. Include how many support cases were raised.
For 1 hour and 30 minutes between 12:30 and 2 on 11/26/2024, our users were unable to order pizzas this affected 1 customer (100% of system users), who were unable to order pizza. 0 tickets were submitted.

## Timeline

All times are UTC.

- _5:50_ - First order failed
- _5:52_ - Alerts updated to include Pizza factory orders
- _6:00_ - found errors in the logs showing what was going wrong
- _6:19_ - changed Factory API key to key sent by factory
- _6:20_ - changed API key in github secrets
- _6:30_ - checked AWS to see that it had the updated key
- _6:40_ - switch keys back to  original
- _6:50_ - changed factory URL to be the URL provided by the factory with the new fixkey
- _6:55_ - visited URL sent by factory chaos resolved
- _6:59_ - functionality restored 
- _7:02_ -First succesful order since the incident

## Response

Who responded to the incident? When did they respond, and what did they do? Note any delays or obstacles to responding.

Koby responded to the incident with minor delays. He started by reading the logs and found the URL from the factory. The largest delay was some confusion with if the API key needed to be replaced by the new key that was sent by the factory. This caused Koby to follow a rabbit hole which added significant time to the solution. 

# Root cause

The root cause of the incident was when an engineer selected I'm ready for some chaos on the CS329 autoGrader. This caused the factory to change the API key.

## Resolution

Describe how the service was restored and the incident was deemed over. Detail how the service was successfully restored and you knew how what steps you needed to take to recovery.

Depending on the scenario, consider these questions: How could you improve time to mitigation? How could you have cut that time by half?

The service was restored after the API keys were set to the original, and the URL provided by the factory was followed. I came to the idea to follow the URL when I realized that the fixKey they sent was not a replacement api key.

Had we known that the fixkey sent was not a replacement api key the time would have been cut in half. 

# Prevention

No other incidents were caused by selecting I'm ready for some chaos. 


# Action items

In the future we will not press that button.


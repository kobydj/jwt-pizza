# **Curiosity Report: HAR Files (HTTP Archive Files)**
HAR (HTTP Archive) files are extremely useful for communicating and sharing web traffic logs. In class we used them to generate load tests with grafana, but they can be used for way more. This can include logging the web traffica and requests on your site when a certain process is followed, like ordering a pizza. This can be shared with your team to find insights into the requests, responces and the metrics of those requests.

HAR files include a timeline of network activity which includes HTTP, Headers, cookies, and latency. Which makes them very detailed ways to log, events. This means that you would most likely not want to have HAR files from every event being logged but in cases when you need to share those metrics or need all the details they could be useful.



# Questions JSON-encoding

```
{
    "sections":[{
        "title":"<the section title>",
        "description:"<optional section description>"
        "questions":[
            {
                "title": "<title of question>",
                "type": "<mchoices|checkboxes|short|paragraph>",
                "responses":
                [
                    {
                        "title": "<title of response (not required for responses of type "other")>",
                        "description": "<optional response description used as hint>",
                        "type": "<choice|other>"
                    }
                ]
            }
        ]
    }]

}
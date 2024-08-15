# Microsoft Azure TTS Talking Avatar

[中文版README](https://github.com/chikin030611/Azure-Speech-Avatar/blob/main/README_ZH.md)

(I forgot to change git user before commiting the changes, so Joe was also the contributor lol.)

**Basic** sample is the TTS talking avatar which only speaks the prompt you have given.

**Chat** sample is the TTS talking avatar integrated with *Azure OpenAI ChatGPT*, which analyzes the text and gives out the ansewr.

# Basic Sample

This sample demonstrates the basic usage of Azure text-to-speech avatar real-time API.

## How to run

### Prerequisites
Azure resources needed for this sample:
- **Azure Speech service**
  - **Locations**: Southeast Asia, North Europe, West Europe, Sweden Central, South Central US, and West US 2
  - **Pricing tier**: S0 Standard
    
### Running the website
Run the sample code by opening `basic.html` in a browser.

By pressing the blue question buttons, a question is asked. The avatar will speak aloud the answer preset in the background logic.

## Partial Configuration Explanation

### Azure Speech Resource
- **Private Endpoint**: the private endpoint of your Azure speech resource. Please refer to [speech-services-private-link](https://learn.microsoft.com/azure/ai-services/speech-service/speech-services-private-link) to learn more about private endpoint.

### TTS Configuration
- **TTS Voice**: [Available TTS voices list](https://learn.microsoft.com/azure/ai-services/speech-service/language-support?tabs=tts#supported-languages)
- **Custom Voice Deployment ID (Endpoint ID)**: the deployment ID (also called endpoint ID) of your custom voice.
- **Personal Voice Speaker Profile ID**: the personal voice speaker profile ID of your personal voice. Please follow [here](https://learn.microsoft.com/azure/ai-services/speech-service/personal-voice-overview) to view and create personal voice.

### Avatar Configuration
- **Avatar Character** and **Avatar Style**: [List of Avatar Character and Avatar Style](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/text-to-speech-avatar/avatar-gestures-with-ssml#supported-pre-built-avatar-characters-styles-and-gestures)
- **Transparent Background**: When this is checked, the background color of the video stream from server side is automatically set to green(#00FF00FF), and **the js code on client side (check the `makeBackgroundTransparent` function in main.js) will do the real-time matting by replacing the green color with transparent color**.


# Chat Sample

This sample demonstrates the chat scenario, with integration of Azure speech-to-text, Azure OpenAI, and Azure text-to-speech avatar real-time API.

## How to run

### Prerequisites
Azure resources needed for this sample:
- **Azure Speech service**
  - **Locations**: Southeast Asia, North Europe, West Europe, Sweden Central, South Central US, and West US 2
  - **Pricing tier**: S0 Standard
- **Azure OpenAI**
- (Optional) **Azure Cognitive Search**

### Running the website
Run the sample code by opening `chat.html` in a browser.

## Partial Configuration Explanation

### Azure Speech Resource
- **Private Endpoint**: the private endpoint of your Azure speech resource. Please refer to [speech-services-private-link](https://learn.microsoft.com/azure/ai-services/speech-service/speech-services-private-link) to learn more about private endpoint.

### Azure OpenAI Resource
 - **System Prompt**: you can edit this text to preset the context for the chat API. The chat API will then generate the response based on this context.

### Azure Cognitive Search ("Enable On Your Data" needs to be checked)
If you want to constrain the chat within your own data, please follow [Quickstart: Chat with Azure OpenAI models using your own data](https://learn.microsoft.com/azure/cognitive-services/openai/use-your-data-quickstart?pivots=programming-language-studio) to create your data source, and then fill below information:
  - **Endpoint**: the endpoint of your Azure Cognitive Search resource, e.g. `https://your-cogsearch-resource-name.search.windows.net/` , which can be found in the `Overview` section of your Azure Cognitive Search resource in Azure portal, appearing at `Essentials -> Url` field.
  - **API Key**: the API key of your Azure Cognitive Search resource, which can be found in the `Keys` section of your Azure Cognitive Search resource in Azure portal. Please make sure to use the `Admin Key` instead of `Query Key`.
  - **Index Name**: the name of your Azure Cognitive Search index, which can be found in the `Indexes` section of your Azure Cognitive Search resource in Azure portal.

### STT (Speech-To-Text) / TTS (Text-to-Speech) Configuration
- **STT Locale(s)**: the locale(s) of the STT. Here is the [available STT languages list](https://learn.microsoft.com/azure/ai-services/speech-service/language-support?tabs=stt#supported-languages). If multiple locales are specified, the STT will enable multi-language recognition, which means the STT will recognize the speech in any of the specified locales.
- **TTS Voice**: [Available TTS voices list](https://learn.microsoft.com/azure/ai-services/speech-service/language-support?tabs=tts#supported-languages)
- **Custom Voice Deployment ID (Endpoint ID)**: the deployment ID (also called endpoint ID) of your custom voice.
- **Personal Voice Speaker Profile ID**: the personal voice speaker profile ID of your personal voice. Please follow [here](https://learn.microsoft.com/azure/ai-services/speech-service/personal-voice-overview) to view and create personal voice.
- **Continuous Conversation**: If this is checked, the STT will keep listening to your speech, with microphone always on until you click `Stop Microphone` button. If this is not checked, the microphone will automatically stop once an utterance is recognized, and you need click `Start Microphone` every time before you give a speech. **The `Continuous Conversation` mode is suitable for quiet environment, while the `Non-Continuous Conversation` mode is suitable for noisy environment, which can avoid the noise being recorded while you are not speaking.**

### Avatar Configuration
- **Avatar Character** and **Avatar Style**: [List of Avatar Character and Avatar Style](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/text-to-speech-avatar/avatar-gestures-with-ssml#supported-pre-built-avatar-characters-styles-and-gestures)
- **Transparent Background**: When this is checked, the background color of the video stream from server side is automatically set to green(#00FF00FF), and **the js code on client side (check the `makeBackgroundTransparent` function in main.js) will do the real-time matting by replacing the green color with transparent color**.
- **Auto Reconnect**: Check this if you want to enable auto reconnect. If this is checked, the avatar video stream is automatically reconnected once the connection is lost.
- **Use Local Video for Idle**: If this is checked, the avatar video stream is replaced by local video when the avatar is idle. To use this feature, you need to prepare a local video file. Usually, you can record a video of the avatar doing idle action. [Here](https://ttspublic.blob.core.windows.net/sampledata/video/avatar/lisa-casual-sitting-idle.mp4) is a sample video for lisa-casual-sitting avatar idle status. You can download it and put it to `video/lisa-casual-sitting-idle.mp4` under the same folder of `chat.html`.

  
# Additional Tip(s)

- If you want to enforce the avatar to stop speaking before the avatar finishes the utterance, you can click `Stop Speaking` button. This is useful when you want to interrupt the avatar speaking.

- If you want to clear the chat history and start a new round of chat, you can click `Clear Chat History` button. And if you want to stop the avatar service, please click `Close Avatar Session` button to close the connection with avatar service.

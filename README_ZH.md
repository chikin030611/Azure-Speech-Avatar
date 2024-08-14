# Microsoft Azure TTS 說話模型

\* 此README使用了AI由英文翻譯為中文。如有任何句子不通順的問題，建議參考英文版。

（我忘記在提交更改之前更改 git 用戶，所以 Joe 也是貢獻者哈哈。）

**Basic**範例是 TTS 說話模型，它只說出您給出的提示。

**Chat** 範例是與 *Azure OpenAI ChatGPT* 整合的 TTS 說話模型，它可以分析文本並給出答案。

# 基本範例

此範例示範了 Azure 文字轉語音頭像即時 API 的基本用法。

## 如何運行

### 先決條件
此範例所需的 Azure 資源：
- **Azure 語音服務**
 - **地點**：東南亞、北歐、西歐、瑞典中部、美國中南部和美國西部 2
 - **定價等級**：S0 標準
    
### 執行網站
透過在瀏覽器中開啟 `basic.html` 範例程式碼。

按下藍色問題按鈕，會提出一個問題。頭像會說出後台邏輯預設的答案。

## 部分設定說明

### Azure 語音資源
- **Private Endpoint**：Azure 語音資源的私人端點。請參閱 [私人端點使用語音服務](https://learn.microsoft.com/azure/ai-services/speech-service/speech-services-private-link) 以了解有關私人端點的更多資訊。
  
### TTS 配置
- **TTS Voice**：[可用的 TTS 語音清單](https://learn.microsoft.com/azure/ai-services/speech-service/language-support?tabs=tts#supported-languages)
- **Custom Voice Deployment ID (Endpoint ID)**：自訂語音的部署 ID（也稱為端點 ID）。
- **Personal Voice Speaker Profile ID**：您的個人語音的個人語音揚聲器設定檔 ID。請依照[此處](https://learn.microsoft.com/azure/ai-services/speech-service/personal-voice-overview)查看和建立個人語音。

### 模型配置
- **Avatar Character**和**Avatar Style**：[模型角色和模型風格列表](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/text-to-speech-avatar/avatar-gestures-with-ssml#supported-pre-built-avatar-characters-styles-and-gestures)
- **Transparent Background**：勾選此項目後，伺服器端視訊串流的背景顏色會自動設定為綠色(#00FF00FF)，**客戶端的js程式碼（檢查`makeBackgroundTransparent`函數main.js）將透過使用透明顏色替換綠色來進行即時摳圖**。


# 聊天範例

此範例示範了聊天場景，整合了 Azure 語音轉文字、Azure OpenAI 和 Azure 文字轉語音頭像即時 API。

## 如何運行

### 先決條件
此範例所需的 Azure 資源：
- **Azure 語音服務**
 - **地點**：東南亞、北歐、西歐、瑞典中部、美國中南部和美國西部 2
 - **定價等級**：S0 標準
- **Azure OpenAI**
-（可選）**Azure 認知搜尋**

### 執行網站
透過在瀏覽器中開啟 `chat.html` 範例程式碼。

## 部分設定說明

### Azure 語音資源
- **Private Endpoint**：Azure 語音資源的私人端點。請參閱 [私人端點使用語音服務](https://learn.microsoft.com/azure/ai-services/speech-service/speech-services-private-link) 以了解有關私人端點的更多資訊。
  
### Azure OpenAI Resource
 - **System Prompt**: 您可以編輯此文字以預設聊天 API 的上下文。然後聊天 API 將根據此上下文產生回應。

### Azure 認知搜尋（需要選取「啟用您的資料」）
如果您想將聊天限制在您自己的資料內，請按照[快速入門：使用您自己的資料與Azure OpenAI 模型聊天](https://learn.microsoft.com/azure/cognitive-services/openai/use -your- data-quickstart?pivots=programming-language-studio) 建立資料來源，然後填寫以下資訊：
 - **Endpoint**：Azure 認知搜尋資源的端點，例如https://your-cogsearch-resource-name.search.windows.net/，可以在 Azure 入口網站中的 Azure 認知搜尋資源的「概述」部分中找到，顯示在「Essentials -> Url」欄位中。
 - **API Key**：Azure 認知搜尋資源的 API 金鑰，可在 Azure 入口網站中 Azure 認知搜尋資源的「金鑰」部分找到。請確保使用“管理密鑰”而不是“查詢密鑰”。
 - **Index Name**：Azure 認知搜尋索引的名稱，可在 Azure 入口網站中 Azure 認知搜尋資源的「索引」部分中找到。

### STT（語音轉文字）/TTS（文字轉語音）配置
- **STT Locale(s)**：STT 的區域設定。以下是[可用的 STT 語言清單](https://learn.microsoft.com/azure/ai-services/speech-service/language-support?tabs=stt#supported-languages)。如果指定了多個語言環境，STT 將啟用多語言識別，這表示 STT 將識別任何指定語言環境中的語音。
- **TTS Voice**：[可用的 TTS 語音清單](https://learn.microsoft.com/azure/ai-services/speech-service/language-support?tabs=tts#supported-languages)
- **Custom Voice Deployment ID (Endpoint ID)**：自訂語音的部署 ID（也稱為端點 ID）。
- **Personal Voice Speaker Profile ID**：您的個人語音的個人語音揚聲器設定檔 ID。請依照[此處](https://learn.microsoft.com/azure/ai-services/speech-service/personal-voice-overview)查看和建立個人語音。
- **Continuous Conversation**: 如果選取此項，STT 將繼續收聽您的講話，麥克風始終打開，直到您點擊「停止麥克風」按鈕。如果不勾選，一旦識別到發言，麥克風就會自動停止，每次發言前都需要點擊「啟動麥克風」。 **‘連續通話’模式適用於安靜的環境，‘非連續通話’模式適用於吵雜的環境，可以避免您不說話時的噪音被記錄。**
  
### 模型配置
- **Avatar Character**和**Avatar Style**：[模型角色和模型風格列表](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/text - to-speech-avatar/avatar-gestures-with-ssml#supported-pre-built-avatar-characters-styles-and-gestures)
- **Transparent Background**：勾選此項目後，伺服器端視訊串流的背景顏色會自動設定為綠色(#00FF00FF)，**客戶端的js程式碼（檢查`makeBackgroundTransparent`函數main.js）將透過使用透明顏色替換綠色來進行即時摳圖**。
- **Auto Reconnect**: 如果您想要啟用自動重新連接，請選取此項目。如果選取此項，一旦連線遺失，頭像視訊串流將自動重新連線。
- **Use Local Video for Idle**: 如果選取此選項，則當頭像空閒時，頭像視訊串流將替換為本地視訊。要使用此功能，您需要準備一個本機視訊檔案。通常，您可以錄製虛擬人物閒置動作的影片。 [此處](https://ttspublic.blob.core.windows.net/sampledata/video/avatar/lisa-casual-sitting-idle.mp4)是lisa-casual-sitting頭像空閒狀態的範例影片。您可以下載它並將其放在“chat.html”同一資料夾下的“video/lisa-casual-sitting-idle.mp4”中。

  
# 額外提示

- 如果您想在頭像說完之前強制其停止說話，您可以點擊「停止說話」按鈕。當您想打斷頭像說話時，這非常有用。

- 如果您想清除聊天記錄並開始新一輪聊天，可以點擊「清除聊天記錄」按鈕。如果您想停止頭像服務，請點擊「關閉頭像會話」按鈕來關閉與頭像服務的連線。

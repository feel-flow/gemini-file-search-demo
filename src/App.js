import React, { useState, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import './App.css';

function App() {
  // localStorageからAPIキーを読み込む
  const [apiKey, setApiKey] = useState(() => {
    const savedApiKey = localStorage.getItem('gemini_api_key');
    return savedApiKey || '';
  });
  const [file, setFile] = useState(null);
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [error, setError] = useState('');

  // APIキーが変更されたときにlocalStorageに保存
  useEffect(() => {
    if (apiKey) {
      localStorage.setItem('gemini_api_key', apiKey);
    } else {
      localStorage.removeItem('gemini_api_key');
    }
  }, [apiKey]);

  // ファイルアップロード処理
  const handleFileUpload = async () => {
    if (!apiKey || !file) {
      setError('APIキーとファイルを選択してください');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      
      // ファイルを読み込む
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const fileData = {
            inlineData: {
              data: e.target.result.split(',')[1],
              mimeType: file.type
            }
          };

          setUploadedFile({
            name: file.name,
            type: file.type,
            data: fileData
          });

          setResponse('ファイルがアップロードされました。質問を入力してください。');
          setLoading(false);
        } catch (err) {
          setError('ファイルのアップロードに失敗しました: ' + err.message);
          setLoading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError('エラー: ' + err.message);
      setLoading(false);
    }
  };

  // 質問処理
  const handleQuery = async () => {
    if (!apiKey || !uploadedFile || !query) {
      setError('ファイルをアップロードし、質問を入力してください');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      const result = await model.generateContent([
        query,
        uploadedFile.data
      ]);

      const text = result.response.text();
      setResponse(text);
      setLoading(false);
    } catch (err) {
      setError('質問の処理に失敗しました: ' + err.message);
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Gemini File Search デモ</h1>
        <p>株式会社フィールフロウ - 生成AI技術検証</p>
      </header>

      <div className="container">
        <div className="section">
          <h2>1. APIキー設定</h2>
          <input
            type="password"
            placeholder="Gemini API Key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="input-field"
          />
          {apiKey && (
            <p className="success" style={{ marginTop: '10px', fontSize: '0.9em' }}>
              ✓ APIキーが保存されました（次回アクセス時に自動入力されます）
            </p>
          )}
        </div>

        <div className="section">
          <h2>2. ファイルアップロード</h2>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            accept=".txt,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.json,.png,.jpg,.jpeg,.gif,.webp"
            className="file-input"
          />
          <button 
            onClick={handleFileUpload} 
            disabled={loading || !apiKey || !file}
            className="button"
          >
            ファイルをアップロード
          </button>
          {uploadedFile && (
            <p className="success">✓ {uploadedFile.name} がアップロードされました</p>
          )}
        </div>

        <div className="section">
          <h2>3. 質問入力</h2>
          <textarea
            placeholder="ファイルに関する質問を入力してください..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="textarea-field"
            rows="4"
          />
          <button 
            onClick={handleQuery} 
            disabled={loading || !uploadedFile || !query}
            className="button"
          >
            質問する
          </button>
        </div>

        {loading && <div className="loading">処理中...</div>}
        {error && <div className="error">{error}</div>}
        
        {response && (
          <div className="section">
            <h2>回答</h2>
            <div className="response-box">
              {response}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

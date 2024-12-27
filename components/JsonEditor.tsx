import { useState } from 'react'
import AceEditor from 'react-ace'

import 'ace-builds/src-noconflict/mode-json'
import 'ace-builds/src-noconflict/theme-github'

interface JsonEditorProps {
  initialData: any
  onUpdate: (newData: any) => void
}

export const JsonEditor = ({ initialData, onUpdate }: JsonEditorProps) => {
  const [json, setJson] = useState(JSON.stringify(initialData, null, 2))

  const handleChange = (newValue: string) => {
    setJson(newValue)
    try {
      const parsedData = JSON.parse(newValue)
      onUpdate(parsedData)
    } catch (error) {
      console.error('Invalid JSON:', error)
    }
  }

  return (
    <AceEditor
      mode="json"
      theme="github"
      onChange={handleChange}
      name="json-editor"
      editorProps={{ $blockScrolling: true }}
      setOptions={{
        useWorker: false,
        showLineNumbers: true,
        tabSize: 2,
      }}
      value={json}
      width="100%"
      height="300px"
    />
  )
}

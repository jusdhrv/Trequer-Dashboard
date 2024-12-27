import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"

const DataWidget = () => {
  return (
    <Card className="w-full h-full">
      <CardHeader>
        <CardTitle>Raw Data Access</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-full overflow-auto">
          <pre className="text-sm">
            {JSON.stringify({
              timestamp: new Date().toISOString(),
              temperature: 23.5,
              pressure: 1013.25,
              humidity: 45,
              radiation: 0.12,
            }, null, 2)}
          </pre>
        </div>
      </CardContent>
    </Card>
  )
}

export default DataWidget


import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';

interface Server {
  id: string;
  name: string;
  country: string;
  flag: string;
  ping: number;
  load: number;
}

const servers: Server[] = [
  { id: '1', name: 'Нидерланды', country: 'Amsterdam', flag: '🇳🇱', ping: 12, load: 45 },
  { id: '2', name: 'США', country: 'New York', flag: '🇺🇸', ping: 85, load: 62 },
  { id: '3', name: 'Германия', country: 'Frankfurt', flag: '🇩🇪', ping: 18, load: 38 },
  { id: '4', name: 'Великобритания', country: 'London', flag: '🇬🇧', ping: 25, load: 51 },
  { id: '5', name: 'Япония', country: 'Tokyo', flag: '🇯🇵', ping: 156, load: 29 },
  { id: '6', name: 'Сингапур', country: 'Singapore', flag: '🇸🇬', ping: 178, load: 44 },
];

const Index = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [selectedServer, setSelectedServer] = useState<Server>(servers[0]);
  const [autoConnect, setAutoConnect] = useState(true);
  const [connectionTime, setConnectionTime] = useState(0);
  const [downloadSpeed, setDownloadSpeed] = useState(0);
  const [uploadSpeed, setUploadSpeed] = useState(0);
  const [dataUsed, setDataUsed] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isConnected) {
      interval = setInterval(() => {
        setConnectionTime((prev) => prev + 1);
        setDownloadSpeed(Math.floor(Math.random() * 20) + 80);
        setUploadSpeed(Math.floor(Math.random() * 10) + 40);
        setDataUsed((prev) => prev + Math.random() * 0.5);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isConnected]);

  const toggleConnection = () => {
    if (!isConnected) {
      setConnectionTime(0);
      setDataUsed(0);
    }
    setIsConnected(!isConnected);
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Icon name="Shield" size={24} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold">SecureVPN</h1>
          </div>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Icon name="Settings" size={20} />
          </Button>
        </header>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <Card className="glass p-8 text-center animate-fade-in">
              <div className="mb-6">
                <div className="relative inline-block">
                  <div className={`w-40 h-40 rounded-full flex items-center justify-center transition-all duration-500 ${
                    isConnected 
                      ? 'bg-gradient-to-br from-primary to-secondary animate-pulse-glow' 
                      : 'bg-muted'
                  }`}>
                    <Icon 
                      name={isConnected ? "ShieldCheck" : "Shield"} 
                      size={64} 
                      className="text-white"
                    />
                  </div>
                  {isConnected && (
                    <div className="absolute inset-0 rounded-full border-4 border-primary opacity-50 pulse-ring"></div>
                  )}
                </div>
              </div>

              <h2 className="text-2xl font-semibold mb-2">
                {isConnected ? 'Защищено' : 'Не защищено'}
              </h2>
              <p className="text-muted-foreground mb-6">
                {isConnected 
                  ? `Подключено к ${selectedServer.name}` 
                  : 'Нажмите для подключения'}
              </p>

              <Button 
                onClick={toggleConnection}
                size="lg"
                className={`w-full text-lg py-6 transition-all duration-300 ${
                  isConnected 
                    ? 'bg-destructive hover:bg-destructive/90' 
                    : 'bg-gradient-to-r from-primary to-secondary hover:opacity-90'
                }`}
              >
                {isConnected ? 'Отключиться' : 'Подключиться'}
              </Button>
            </Card>

            {isConnected && (
              <Card className="glass p-6 animate-scale-in">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Icon name="Activity" size={20} className="text-primary" />
                  Статистика
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <Icon name="Download" size={16} />
                      <span>Загрузка</span>
                    </div>
                    <p className="text-2xl font-bold">{downloadSpeed} Мбит/с</p>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <Icon name="Upload" size={16} />
                      <span>Отдача</span>
                    </div>
                    <p className="text-2xl font-bold">{uploadSpeed} Мбит/с</p>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <Icon name="Clock" size={16} />
                      <span>Время</span>
                    </div>
                    <p className="text-2xl font-bold">{formatTime(connectionTime)}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <Icon name="HardDrive" size={16} />
                      <span>Трафик</span>
                    </div>
                    <p className="text-2xl font-bold">{dataUsed.toFixed(2)} ГБ</p>
                  </div>
                </div>
              </Card>
            )}

            <Card className="glass p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Icon name="Zap" size={20} className="text-secondary" />
                    Автоподключение
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    При запуске или потере сети
                  </p>
                </div>
                <Switch 
                  checked={autoConnect} 
                  onCheckedChange={setAutoConnect}
                />
              </div>
            </Card>
          </div>

          <div>
            <Card className="glass p-6 animate-fade-in">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Icon name="Globe" size={20} className="text-primary" />
                Серверы
              </h3>
              
              <div className="space-y-2">
                {servers.map((server) => (
                  <button
                    key={server.id}
                    onClick={() => setSelectedServer(server)}
                    className={`w-full p-4 rounded-lg transition-all duration-200 text-left ${
                      selectedServer.id === server.id
                        ? 'bg-primary/20 border-2 border-primary'
                        : 'bg-muted/50 hover:bg-muted border-2 border-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{server.flag}</span>
                        <div>
                          <h4 className="font-semibold">{server.name}</h4>
                          <p className="text-sm text-muted-foreground">{server.country}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-sm">
                          <Icon name="Wifi" size={14} className="text-primary" />
                          <span className="font-semibold">{server.ping}ms</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Загрузка сервера</span>
                        <span>{server.load}%</span>
                      </div>
                      <Progress value={server.load} className="h-1.5" />
                    </div>
                  </button>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;

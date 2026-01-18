import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';

const VPN_API_URL = 'https://functions.poehali.dev/0aae4a58-30b6-4698-bf61-1c63386a372c';

interface Server {
  id: string;
  name: string;
  country: string;
  flag: string;
  ping: number;
  load: number;
  ip?: string;
  status?: string;
}

const Index = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [servers, setServers] = useState<Server[]>([]);
  const [selectedServer, setSelectedServer] = useState<Server | null>(null);
  const [autoConnect, setAutoConnect] = useState(true);
  const [connectionTime, setConnectionTime] = useState(0);
  const [downloadSpeed, setDownloadSpeed] = useState(0);
  const [uploadSpeed, setUploadSpeed] = useState(0);
  const [dataUsed, setDataUsed] = useState(0);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchServers();
  }, []);

  const fetchServers = async () => {
    try {
      const response = await fetch(`${VPN_API_URL}?action=servers`);
      const data = await response.json();
      setServers(data.servers);
      if (data.servers.length > 0) {
        setSelectedServer(data.servers[0]);
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить список серверов',
        variant: 'destructive',
      });
    }
  };

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

  useEffect(() => {
    if (autoConnect && !isConnected && selectedServer) {
      const autoConnectTimer = setTimeout(() => {
        handleConnect();
      }, 2000);
      return () => clearTimeout(autoConnectTimer);
    }
  }, [autoConnect, selectedServer]);

  const handleConnect = async () => {
    if (!selectedServer || isConnecting) return;
    
    setIsConnecting(true);
    
    try {
      const response = await fetch(`${VPN_API_URL}?action=connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ serverId: selectedServer.id }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setIsConnected(true);
        setSessionId(data.sessionId);
        setConnectionTime(0);
        setDataUsed(0);
        toast({
          title: 'Подключено!',
          description: `Вы подключены к серверу ${selectedServer.name}`,
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка подключения',
        description: 'Не удалось подключиться к VPN',
        variant: 'destructive',
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!sessionId || isConnecting) return;
    
    setIsConnecting(true);
    
    try {
      const response = await fetch(`${VPN_API_URL}?action=disconnect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setIsConnected(false);
        setSessionId(null);
        toast({
          title: 'Отключено',
          description: 'VPN соединение разорвано',
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось отключиться от VPN',
        variant: 'destructive',
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const toggleConnection = () => {
    if (isConnected) {
      handleDisconnect();
    } else {
      handleConnect();
    }
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
                      name={isConnected ? "ShieldCheck" : isConnecting ? "Loader2" : "Shield"} 
                      size={64} 
                      className={`text-white ${isConnecting ? 'animate-spin' : ''}`}
                    />
                  </div>
                  {isConnected && (
                    <div className="absolute inset-0 rounded-full border-4 border-primary opacity-50 pulse-ring"></div>
                  )}
                </div>
              </div>

              <h2 className="text-2xl font-semibold mb-2">
                {isConnected ? 'Защищено' : isConnecting ? 'Подключение...' : 'Не защищено'}
              </h2>
              <p className="text-muted-foreground mb-6">
                {isConnected && selectedServer
                  ? `Подключено к ${selectedServer.name} (${selectedServer.ip})` 
                  : selectedServer
                  ? 'Нажмите для подключения'
                  : 'Загрузка серверов...'}
              </p>

              <Button 
                onClick={toggleConnection}
                size="lg"
                disabled={isConnecting || !selectedServer}
                className={`w-full text-lg py-6 transition-all duration-300 ${
                  isConnected 
                    ? 'bg-destructive hover:bg-destructive/90' 
                    : 'bg-gradient-to-r from-primary to-secondary hover:opacity-90'
                }`}
              >
                {isConnecting ? 'Подключение...' : isConnected ? 'Отключиться' : 'Подключиться'}
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
                Серверы ({servers.length} доступно)
              </h3>
              
              <div className="space-y-2">
                {servers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Icon name="Loader2" size={32} className="mx-auto mb-2 animate-spin" />
                    <p>Загрузка серверов...</p>
                  </div>
                ) : (
                  servers.map((server) => (
                    <button
                      key={server.id}
                      onClick={() => !isConnected && setSelectedServer(server)}
                      disabled={isConnected}
                      className={`w-full p-4 rounded-lg transition-all duration-200 text-left ${
                        selectedServer?.id === server.id
                          ? 'bg-primary/20 border-2 border-primary'
                          : 'bg-muted/50 hover:bg-muted border-2 border-transparent'
                      } ${isConnected ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                          {server.status === 'online' && (
                            <span className="text-xs text-green-500">● Online</span>
                          )}
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
                  ))
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;

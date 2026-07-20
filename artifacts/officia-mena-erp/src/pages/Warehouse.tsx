import { useState } from 'react';
import { useGetWarehouseStats, useListProducts, useListTanks, useListStockMovements, ListProductsCategory } from '@workspace/api-client-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Package, Droplet, Sprout, AlertTriangle, ArrowUpRight, ArrowDownRight, History, ThermometerSun, Zap, Flame } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export function Warehouse() {
  const [activeTab, setActiveTab] = useState<string>('all');
  
  const { data: stats } = useGetWarehouseStats();
  const { data: products } = useListProducts(activeTab !== 'all' ? { category: activeTab as ListProductsCategory } : undefined);
  const { data: tanks } = useListTanks();
  const { data: movements } = useListStockMovements();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">إدارة المستودع والمخزون</h1>
          <p className="text-sm text-muted-foreground mt-1">المنتجات البترولية، الأسمدة، والمواد العامة</p>
        </div>
      </div>

      {stats && stats.lowStockCount > 0 && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive-foreground p-4 rounded-xl flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <div>
            <h3 className="font-semibold text-sm">تنبيه المخزون المنخفض</h3>
            <p className="text-xs opacity-90">يوجد {stats.lowStockCount} منتجات وصلت لحد إعادة الطلب. يرجى مراجعة القائمة.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card/50 border-white/5 backdrop-blur-xl">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">إجمالي المنتجات</p>
                <div className="text-2xl font-bold text-white">{stats?.totalProducts || 0}</div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Package className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card/50 border-white/5 backdrop-blur-xl">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">المخزون البترولي</p>
                <div className="text-2xl font-bold text-white">
                  {new Intl.NumberFormat('ar-SA').format(stats?.petroleumLiters || 0)} <span className="text-sm font-normal text-muted-foreground">لتر</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <Droplet className="h-5 w-5 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-white/5 backdrop-blur-xl">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">مخزون الأسمدة</p>
                <div className="text-2xl font-bold text-white">
                  {new Intl.NumberFormat('ar-SA').format(stats?.fertilizerTons || 0)} <span className="text-sm font-normal text-muted-foreground">طن</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
                <Sprout className="h-5 w-5 text-secondary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-white/5 backdrop-blur-xl">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">قيمة المخزون</p>
                <div className="text-2xl font-bold text-white">
                  {new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR', maximumFractionDigits: 0 }).format(stats?.totalStockValue || 0)}
                </div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <ArrowUpRight className="h-5 w-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {tanks && tanks.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">خزانات الوقود والمواد السائلة</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {tanks.map((tank) => {
              const fillPct = (tank.currentLiters / tank.capacityLiters) * 100;
              const statusColor = fillPct > 60 ? 'bg-secondary' : fillPct > 30 ? 'bg-amber-500' : 'bg-destructive';
              const bgStatusColor = fillPct > 60 ? 'bg-secondary/20' : fillPct > 30 ? 'bg-amber-500/20' : 'bg-destructive/20';
              
              return (
                <Card key={tank.id} className="bg-card/50 border-white/5 backdrop-blur-xl">
                  <CardContent className="p-5">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-bold text-white">{tank.name}</h4>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="outline" className="text-xs bg-white/5 border-white/10">{tank.fuelType}</Badge>
                          <Badge variant="outline" className={`text-xs border-0 ${
                            tank.status === 'active' ? 'text-secondary bg-secondary/10' : 
                            tank.status === 'maintenance' ? 'text-amber-500 bg-amber-500/10' : 
                            'text-muted-foreground bg-white/10'
                          }`}>
                            {tank.status === 'active' ? 'نشط' : tank.status === 'maintenance' ? 'صيانة' : 'غير نشط'}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground">السعة الإجمالية</div>
                        <div className="font-mono text-sm">{tank.capacityLiters.toLocaleString()} L</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm font-medium">
                        <span>المستوى الحالي</span>
                        <span>{fillPct.toFixed(1)}%</span>
                      </div>
                      <div className="h-2.5 w-full bg-white/10 rounded-full overflow-hidden flex" dir="ltr">
                        <div className={`h-full ${statusColor} rounded-full`} style={{ width: `${fillPct}%` }} />
                      </div>
                      <div className="text-xs text-muted-foreground text-center mt-2 font-mono">
                        {tank.currentLiters.toLocaleString()} L
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-4">
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-white/5 border border-white/10 p-1 w-full justify-start overflow-x-auto">
              <TabsTrigger value="all" className="data-[state=active]:bg-white/10 data-[state=active]:text-white">الكل</TabsTrigger>
              <TabsTrigger value="petroleum" className="data-[state=active]:bg-white/10 data-[state=active]:text-white flex gap-2"><Droplet className="w-3.5 h-3.5" /> البترول</TabsTrigger>
              <TabsTrigger value="fertilizer" className="data-[state=active]:bg-white/10 data-[state=active]:text-white flex gap-2"><Sprout className="w-3.5 h-3.5" /> الأسمدة</TabsTrigger>
              <TabsTrigger value="general" className="data-[state=active]:bg-white/10 data-[state=active]:text-white flex gap-2"><Package className="w-3.5 h-3.5" /> عام</TabsTrigger>
            </TabsList>

            <div className="mt-4 space-y-3">
              {products?.map((product) => (
                <Card key={product.id} className="bg-card/50 border-white/5 backdrop-blur-xl overflow-hidden group">
                  <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        product.category === 'petroleum' ? 'bg-amber-500/20 text-amber-500' :
                        product.category === 'fertilizer' ? 'bg-secondary/20 text-secondary' :
                        'bg-primary/20 text-primary'
                      }`}>
                        {product.category === 'petroleum' ? <Droplet className="w-6 h-6" /> : 
                         product.category === 'fertilizer' ? <Sprout className="w-6 h-6" /> : 
                         <Package className="w-6 h-6" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-lg text-white">{product.nameAr || product.name}</h4>
                          {product.currentStock <= product.reorderLevel && (
                            <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">مخزون منخفض</Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground flex gap-3 mt-1 font-mono">
                          <span>{product.sku}</span>
                          <span>•</span>
                          <span>{product.category === 'petroleum' ? 'بترول' : product.category === 'fertilizer' ? 'أسمدة' : 'عام'}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-8 md:justify-end">
                      <div className="text-center md:text-right">
                        <div className="text-xs text-muted-foreground mb-1">المخزون الحالي</div>
                        <div className="font-bold text-lg font-mono">
                          {product.currentStock.toLocaleString()} <span className="text-sm font-normal text-muted-foreground font-sans">{product.unit}</span>
                        </div>
                      </div>
                      <div className="text-center md:text-right hidden sm:block">
                        <div className="text-xs text-muted-foreground mb-1">التكلفة</div>
                        <div className="font-bold text-lg font-mono">
                          {product.unitCost.toLocaleString()} <span className="text-sm font-normal text-muted-foreground font-sans">SAR</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Category specific details row */}
                  {product.category === 'petroleum' && (
                    <div className="bg-white/5 px-4 py-2 border-t border-white/5 flex flex-wrap gap-4 text-xs">
                      {product.fuelType && <div className="flex items-center gap-1.5"><Flame className="w-3.5 h-3.5 text-amber-500" /> <span className="text-muted-foreground">النوع:</span> <span className="font-medium text-white">{product.fuelType}</span></div>}
                      {product.adrClass && <div className="flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> <span className="text-muted-foreground">فئة ADR:</span> <span className="font-medium text-white">{product.adrClass}</span></div>}
                      {product.density && <div className="flex items-center gap-1.5"><span className="text-muted-foreground">الكثافة:</span> <span className="font-mono text-white">{product.density} kg/L</span></div>}
                      {product.flashPoint && <div className="flex items-center gap-1.5"><ThermometerSun className="w-3.5 h-3.5 text-amber-500" /> <span className="text-muted-foreground">نقطة الوميض:</span> <span className="font-mono text-white">{product.flashPoint}°C</span></div>}
                      {product.octaneRating && <div className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-amber-500" /> <span className="text-muted-foreground">أوكتان:</span> <span className="font-mono text-white">{product.octaneRating}</span></div>}
                    </div>
                  )}

                  {product.category === 'fertilizer' && (
                    <div className="bg-white/5 px-4 py-3 border-t border-white/5">
                      <div className="flex flex-col sm:flex-row gap-4 sm:items-center text-xs">
                        {product.npkN != null && product.npkP != null && product.npkK != null && (
                          <div className="flex items-center gap-2 flex-1 max-w-xs">
                            <span className="text-muted-foreground whitespace-nowrap">نسبة NPK:</span>
                            <div className="flex h-3 w-full rounded-sm overflow-hidden text-[9px] font-bold text-center text-white/90 leading-3" dir="ltr">
                              <div className="bg-[#4CAF50] h-full flex items-center justify-center" style={{ flex: product.npkN }}>{product.npkN}</div>
                              <div className="bg-[#FF9800] h-full flex items-center justify-center" style={{ flex: product.npkP }}>{product.npkP}</div>
                              <div className="bg-[#9C27B0] h-full flex items-center justify-center" style={{ flex: product.npkK }}>{product.npkK}</div>
                            </div>
                          </div>
                        )}
                        <div className="flex flex-wrap gap-4">
                          {product.fertilizerType && <div><span className="text-muted-foreground">النوع:</span> <span className="font-medium text-white">{product.fertilizerType}</span></div>}
                          {product.bagWeight && <div><span className="text-muted-foreground">وزن الكيس:</span> <span className="font-mono text-white">{product.bagWeight} kg</span></div>}
                          {product.halalCertified && <Badge variant="outline" className="text-[10px] h-4 px-1.5 bg-green-500/10 text-green-500 border-green-500/20">حلال</Badge>}
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              ))}
              
              {(!products || products.length === 0) && (
                <div className="text-center py-12 text-muted-foreground bg-card/20 rounded-xl border border-white/5 border-dashed">
                  لا توجد منتجات في هذا التصنيف
                </div>
              )}
            </div>
          </Tabs>
        </div>

        <div className="lg:col-span-1">
          <Card className="bg-card/50 border-white/5 backdrop-blur-xl h-full">
            <CardHeader className="pb-3 border-b border-white/5">
              <CardTitle className="text-base flex items-center gap-2">
                <History className="w-4 h-4 text-primary" />
                سجل الحركة
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-white/5 max-h-[600px] overflow-y-auto">
                {movements?.slice(0, 15).map((mov) => (
                  <div key={mov.id} className="p-4 hover:bg-white/5 transition-colors">
                    <div className="flex justify-between items-start mb-1">
                      <div className="font-medium text-sm text-white line-clamp-1" title={mov.productName}>{mov.productName}</div>
                      <div className={`flex items-center gap-1 font-mono text-xs font-bold whitespace-nowrap ${mov.type === 'in' ? 'text-secondary' : mov.type === 'out' ? 'text-amber-500' : 'text-blue-500'}`}>
                        {mov.type === 'in' ? '+' : mov.type === 'out' ? '-' : ''}
                        {mov.quantity}
                        {mov.type === 'in' ? <ArrowDownRight className="w-3 h-3" /> : mov.type === 'out' ? <ArrowUpRight className="w-3 h-3" /> : null}
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <div className="text-xs text-muted-foreground">{mov.reference}</div>
                      <div className="text-[10px] text-muted-foreground font-mono">{new Date(mov.createdAt).toLocaleDateString('en-GB')}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

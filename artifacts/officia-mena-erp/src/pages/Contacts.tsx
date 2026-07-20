import { useState } from 'react';
import { useListContacts, ListContactsType } from '@workspace/api-client-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Filter, Phone, Mail, MapPin, Building, ChevronLeft } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function Contacts() {
  const [activeTab, setActiveTab] = useState<string>('all');
  const { data: contacts } = useListContacts(activeTab !== 'all' ? { type: activeTab as ListContactsType } : undefined);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">العملاء والموردون</h1>
          <p className="text-sm text-muted-foreground mt-1">دليل جهات الاتصال التجارية والأرصدة المستحقة</p>
        </div>
        <div className="flex items-center gap-2">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="w-4 h-4 ml-2" /> إضافة جهة اتصال
          </Button>
        </div>
      </div>

      <Card className="bg-card/50 border-white/5 backdrop-blur-xl">
        <div className="p-4 border-b border-white/5 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
            <TabsList className="bg-white/5 border border-white/10 p-1">
              <TabsTrigger value="all" className="data-[state=active]:bg-white/10 data-[state=active]:text-white px-6">الكل</TabsTrigger>
              <TabsTrigger value="client" className="data-[state=active]:bg-white/10 data-[state=active]:text-white px-6">العملاء</TabsTrigger>
              <TabsTrigger value="supplier" className="data-[state=active]:bg-white/10 data-[state=active]:text-white px-6">الموردون</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="البحث بالاسم أو الرقم الضريبي..." className="pl-4 pr-9 bg-white/5 border-white/10" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
          {contacts?.map((contact) => (
            <Card key={contact.id} className="bg-white/5 border-white/10 hover:border-white/20 transition-all group overflow-hidden">
              <div className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center text-lg font-bold text-white uppercase shadow-inner">
                      {(contact.nameAr || contact.name).substring(0, 2)}
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-lg leading-tight">{contact.nameAr || contact.name}</h3>
                      <div className="mt-1">
                        {contact.type === 'client' ? (
                          <Badge variant="outline" className="text-[10px] py-0 h-5 bg-blue-500/10 text-blue-400 border-blue-500/20">عميل</Badge>
                        ) : contact.type === 'supplier' ? (
                          <Badge variant="outline" className="text-[10px] py-0 h-5 bg-amber-500/10 text-amber-400 border-amber-500/20">مورد</Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] py-0 h-5 bg-purple-500/10 text-purple-400 border-purple-500/20">عميل ومورد</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-5">
                  {contact.phone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="w-4 h-4 opacity-70" />
                      <span className="font-mono" dir="ltr">{contact.phone}</span>
                    </div>
                  )}
                  {contact.email && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="w-4 h-4 opacity-70" />
                      <span className="truncate">{contact.email}</span>
                    </div>
                  )}
                  {(contact.city || contact.country) && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 opacity-70" />
                      <span>{[contact.city, contact.country].filter(Boolean).join('، ')}</span>
                    </div>
                  )}
                  {contact.vatNumber && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2 pt-2 border-t border-white/5">
                      <Building className="w-4 h-4 opacity-70" />
                      <span>الرقم الضريبي: <span className="font-mono text-white/80">{contact.vatNumber}</span></span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <div>
                    <div className="text-[10px] text-muted-foreground mb-0.5">الرصيد المستحق</div>
                    <div className={`font-bold font-mono ${
                      (contact.balance || 0) > 0 ? 'text-secondary' : 
                      (contact.balance || 0) < 0 ? 'text-destructive' : 'text-white'
                    }`}>
                      {new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR', signDisplay: 'always' }).format(contact.balance || 0)}
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground group-hover:text-white bg-white/5 group-hover:bg-primary/20 group-hover:text-primary transition-all">
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {(!contacts || contacts.length === 0) && (
          <div className="py-20 text-center flex flex-col items-center justify-center text-muted-foreground">
            <Building className="w-12 h-12 mb-4 opacity-20" />
            <p>لا توجد جهات اتصال مطابقة</p>
          </div>
        )}
      </Card>
    </div>
  );
}

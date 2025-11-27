import { CASResultItem, RedListInfo } from "@/lib/webhookClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { AlertCircle, CheckCircle, AlertTriangle } from "lucide-react";

interface CASResultsDisplayProps {
  data: CASResultItem[];
}

export const CASResultsDisplay = ({ data }: CASResultsDisplayProps) => {
  const [selectedItem, setSelectedItem] = useState<{
    cas: CASResultItem;
    listType: 'redlist' | 'priority' | 'watch';
    info: RedListInfo;
  } | null>(null);

  const getStatusColor = (item: CASResultItem): 'red' | 'yellow' | 'green' => {
    if (item.redlist || item.priority) return 'red';
    if (item.watch) return 'yellow';
    return 'green';
  };

  const getStatusLabel = (item: CASResultItem): string => {
    if (item.redlist) return 'BANNED';
    if (item.priority) return 'PRIORITY';
    if (item.watch) return 'WATCH';
    return 'CLEAN';
  };

  const getStatusIcon = (color: 'red' | 'yellow' | 'green') => {
    if (color === 'red') return <AlertCircle className="h-5 w-5" />;
    if (color === 'yellow') return <AlertTriangle className="h-5 w-5" />;
    return <CheckCircle className="h-5 w-5" />;
  };

  const handleItemClick = (item: CASResultItem) => {
    if (item.priority) {
      setSelectedItem({ cas: item, listType: 'priority', info: item.priority });
    } else if (item.redlist) {
      setSelectedItem({ cas: item, listType: 'redlist', info: item.redlist });
    } else if (item.watch) {
      setSelectedItem({ cas: item, listType: 'watch', info: item.watch });
    }
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">CAS Nummer Analyse</h3>
          <Badge variant="outline">{data.length} stoffen</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.map((item, idx) => {
            const color = getStatusColor(item);
            const label = getStatusLabel(item);
            const isClickable = color === 'red' || color === 'yellow';

            return (
              <Card
                key={idx}
                className={`transition-all ${
                  color === 'red'
                    ? 'border-red-500 bg-red-50 dark:bg-red-950/20'
                    : color === 'yellow'
                    ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20'
                    : 'border-green-500 bg-green-50 dark:bg-green-950/20'
                } ${isClickable ? 'cursor-pointer hover:shadow-md' : ''}`}
                onClick={() => isClickable && handleItemClick(item)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base flex items-center gap-2">
                        {getStatusIcon(color)}
                        {item.naam}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        CAS: {item.cas}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Percentage: </span>
                    <span className="font-medium">{item.percentage}</span>
                  </div>
                  <Badge
                    variant={color === 'green' ? 'outline' : 'default'}
                    className={
                      color === 'red'
                        ? 'bg-red-600 hover:bg-red-700'
                        : color === 'yellow'
                        ? 'bg-yellow-600 hover:bg-yellow-700'
                        : 'text-green-700 border-green-700'
                    }
                  >
                    {label}
                  </Badge>
                  {isClickable && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Klik voor details →
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Red List Details
            </DialogTitle>
            <DialogDescription>
              Gedetailleerde informatie over de gevonden stof
            </DialogDescription>
          </DialogHeader>
          
          {selectedItem && (
            <div className="space-y-4">
              <div className="grid gap-3">
                <div>
                  <span className="text-sm font-semibold text-muted-foreground">Stofnaam:</span>
                  <p className="text-base font-medium">{selectedItem.cas.naam}</p>
                </div>
                
                <div>
                  <span className="text-sm font-semibold text-muted-foreground">CAS Nummer:</span>
                  <p className="text-base font-mono">{selectedItem.cas.cas}</p>
                </div>

                <div>
                  <span className="text-sm font-semibold text-muted-foreground">Percentage:</span>
                  <p className="text-base">{selectedItem.cas.percentage}</p>
                </div>

                <div className="pt-2 border-t">
                  <span className="text-sm font-semibold text-muted-foreground">Substance Name (Red List):</span>
                  <p className="text-base">{selectedItem.info.substance_name}</p>
                </div>

                <div>
                  <span className="text-sm font-semibold text-muted-foreground">Lijst Type:</span>
                  <Badge className="ml-2" variant="destructive">
                    {selectedItem.info.supabase_node}
                  </Badge>
                </div>

                <div>
                  <span className="text-sm font-semibold text-muted-foreground">Chemical Group:</span>
                  <p className="text-base">{selectedItem.info.red_list_chemical_group}</p>
                </div>

                {selectedItem.info.ec_number && (
                  <div>
                    <span className="text-sm font-semibold text-muted-foreground">EC Number:</span>
                    <p className="text-base font-mono">{selectedItem.info.ec_number}</p>
                  </div>
                )}

                <div>
                  <span className="text-sm font-semibold text-muted-foreground">Laatst Gewijzigd:</span>
                  <p className="text-base">{selectedItem.info.date_modified}</p>
                </div>
              </div>

              {selectedItem.listType === 'priority' && (
                <div className="rounded-lg bg-red-50 dark:bg-red-950/20 p-4 border border-red-200 dark:border-red-800">
                  <p className="text-sm font-semibold text-red-800 dark:text-red-200">
                    ⚠️ Deze stof staat op de Priority List en vereist extra aandacht
                  </p>
                </div>
              )}

              {selectedItem.listType === 'watch' && (
                <div className="rounded-lg bg-yellow-50 dark:bg-yellow-950/20 p-4 border border-yellow-200 dark:border-yellow-800">
                  <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">
                    ⚠️ Deze stof staat op de Watch List
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

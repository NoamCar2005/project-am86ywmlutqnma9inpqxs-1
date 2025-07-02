import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { 
  Search, 
  Filter, 
  Play, 
  Star, 
  Download, 
  Share2, 
  Edit,
  Calendar,
  Tag
} from "lucide-react";
import { Creative } from "@/entities";
import { Project } from "@/entities";

export default function CreativeHistory() {
  const [creatives, setCreatives] = useState<any[]>([]);
  const [filteredCreatives, setFilteredCreatives] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCreatives();
  }, []);

  useEffect(() => {
    filterCreatives();
  }, [searchTerm, selectedFilter, creatives]);

  const loadCreatives = async () => {
    try {
      const creativesData = await Creative.list('-created_at');
      setCreatives(creativesData);
    } catch (error) {
      console.error('Error loading creatives:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterCreatives = () => {
    let filtered = creatives;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(creative => 
        creative.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        creative.tags?.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by status
    if (selectedFilter !== "all") {
      filtered = filtered.filter(creative => creative.status === selectedFilter);
    }

    setFilteredCreatives(filtered);
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'planning': { label: 'בתכנון', variant: 'secondary' as const },
      'generating_media': { label: 'יוצר מדיה', variant: 'default' as const },
      'json_built': { label: 'JSON מוכן', variant: 'default' as const },
      'rendered': { label: 'מוכן', variant: 'default' as const },
      'failed': { label: 'נכשל', variant: 'destructive' as const }
    };
    
    const config = statusMap[status as keyof typeof statusMap] || { label: status, variant: 'secondary' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const toggleFavorite = async (creativeId: string) => {
    try {
      const creative = creatives.find(c => c.id === creativeId);
      if (creative) {
        await Creative.update(creativeId, { is_favorite: !creative.is_favorite });
        setCreatives(prev => prev.map(c => 
          c.id === creativeId ? { ...c, is_favorite: !creative.is_favorite } : c
        ));
      }
    } catch (error) {
      console.error('Error updating favorite:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <SidebarTrigger />
          <h1 className="text-3xl font-bold">היסטוריית קריאייטיבים</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="aspect-video bg-gray-200 rounded-t-lg"></div>
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">היסטוריית קריאייטיבים</h1>
          <p className="text-gray-600 mt-1">כל הקריאייטיבים שיצרת עד כה</p>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="חפש קריאייטיבים..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            <div className="flex gap-2">
              {[
                { id: 'all', label: 'הכל' },
                { id: 'rendered', label: 'מוכן' },
                { id: 'generating_media', label: 'ביצירה' },
                { id: 'failed', label: 'נכשל' }
              ].map((filter) => (
                <Button
                  key={filter.id}
                  variant={selectedFilter === filter.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedFilter(filter.id)}
                >
                  {filter.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Creatives Grid */}
      {filteredCreatives.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Play className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || selectedFilter !== 'all' ? 'לא נמצאו תוצאות' : 'עדיין לא יצרת קריאייטיבים'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || selectedFilter !== 'all' 
                ? 'נסה לשנות את החיפוש או הסינון'
                : 'בואו ניצור את הקריאייטיב הראשון שלך'
              }
            </p>
            {!searchTerm && selectedFilter === 'all' && (
              <Button asChild className="gradient-primary text-white">
                <a href="/create">צור קריאייטיב חדש</a>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCreatives.map((creative) => (
            <Card key={creative.id} className="group hover:shadow-lg transition-shadow">
              <div className="relative">
                <div className="aspect-video bg-gray-100 rounded-t-lg overflow-hidden">
                  {creative.thumbnail_url ? (
                    <img 
                      src={creative.thumbnail_url} 
                      alt={creative.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Play className="w-12 h-12" />
                    </div>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`absolute top-2 left-2 ${creative.is_favorite ? 'text-yellow-500' : 'text-white'} hover:bg-black/20`}
                  onClick={() => toggleFavorite(creative.id)}
                >
                  <Star className={`w-4 h-4 ${creative.is_favorite ? 'fill-current' : ''}`} />
                </Button>
              </div>
              
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-gray-900 truncate flex-1">
                    {creative.title || 'ללא כותרת'}
                  </h3>
                  {getStatusBadge(creative.status)}
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(creative.created_at).toLocaleDateString('he-IL')}
                  </div>
                  {creative.duration && (
                    <div>{creative.duration}s</div>
                  )}
                </div>

                {creative.tags && creative.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {creative.tags.slice(0, 3).map((tag: string, index: number) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {creative.tags.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{creative.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-2">
                  {creative.status === 'rendered' && creative.video_url && (
                    <>
                      <Button variant="ghost" size="sm" className="flex-1">
                        <Play className="w-3 h-3 ml-1" />
                        צפה
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="w-3 h-3" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Share2 className="w-3 h-3" />
                      </Button>
                    </>
                  )}
                  <Button variant="ghost" size="sm">
                    <Edit className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
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
  Tag,
  Trash2,
  ChevronLeft,
  ChevronRight,
  AlertTriangle
} from "lucide-react";
import { Creative } from "@/entities";
import { Project } from "@/entities";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function CreativeHistory() {
  const [creatives, setCreatives] = useState<any[]>([]);
  const [filteredCreatives, setFilteredCreatives] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [creativesPerPage] = useState(6);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [creativeToDelete, setCreativeToDelete] = useState<any>(null);

  useEffect(() => {
    loadCreatives();
  }, []);

  useEffect(() => {
    filterCreatives();
  }, [searchTerm, selectedFilter, creatives]);

  const loadCreatives = async () => {
    try {
      const creativesData = await Creative.list();
      setCreatives(Array.isArray(creativesData) ? creativesData : []);
    } catch (error) {
      console.error('Error loading creatives:', error);
      // Set empty array on error
      setCreatives([]);
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
    setCurrentPage(1); // Reset to first page when filtering
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
        setFilteredCreatives(prev => prev.map(c => 
          c.id === creativeId ? { ...c, is_favorite: !creative.is_favorite } : c
        ));
      }
    } catch (error) {
      console.error('Error updating favorite:', error);
    }
  };

  const handleDeleteClick = (creative: any) => {
    setCreativeToDelete(creative);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!creativeToDelete) return;

    try {
      await Creative.delete(creativeToDelete.id);
      setCreatives(prev => prev.filter(c => c.id !== creativeToDelete.id));
      setFilteredCreatives(prev => prev.filter(c => c.id !== creativeToDelete.id));
      setDeleteDialogOpen(false);
      setCreativeToDelete(null);
    } catch (error) {
      console.error('Error deleting creative:', error);
    }
  };

  // Pagination logic
  const indexOfLastCreative = currentPage * creativesPerPage;
  const indexOfFirstCreative = indexOfLastCreative - creativesPerPage;
  const currentCreatives = filteredCreatives.slice(indexOfFirstCreative, indexOfLastCreative);
  const totalPages = Math.ceil(filteredCreatives.length / creativesPerPage);

  const goToPage = (pageNumber: number) => {
    setCurrentPage(pageNumber);
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
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-3 h-4 w-4 text-blue-500" />
              <Input
                placeholder="חפש קריאייטיבים..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10 border-blue-200 focus:border-blue-400"
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
                  className={selectedFilter === filter.id ? "bg-blue-600 hover:bg-blue-700" : ""}
                >
                  {filter.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          מציג {indexOfFirstCreative + 1}-{Math.min(indexOfLastCreative, filteredCreatives.length)} מתוך {filteredCreatives.length} קריאייטיבים
        </p>
        {filteredCreatives.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>עמוד {currentPage} מתוך {totalPages}</span>
          </div>
        )}
      </div>

      {/* Creatives Grid */}
      {filteredCreatives.length === 0 ? (
        <Card className="bg-gradient-to-br from-gray-50 to-blue-50 border-gray-200">
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
        <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentCreatives.map((creative) => (
              <Card key={creative.id} className="group hover:shadow-xl transition-all duration-300 border-l-4 border-l-brand-primary">
              <div className="relative">
                  <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-lg overflow-hidden">
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
                  <div className="absolute top-2 right-2 flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                      className={`${creative.is_favorite ? 'text-yellow-500' : 'text-white'} hover:bg-black/20`}
                  onClick={() => toggleFavorite(creative.id)}
                >
                  <Star className={`w-4 h-4 ${creative.is_favorite ? 'fill-current' : ''}`} />
                </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-red-500/20 hover:text-red-400"
                      onClick={() => handleDeleteClick(creative)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
              </div>
              
              <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
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
                    <div className="flex flex-wrap gap-1 mb-4">
                    {creative.tags.slice(0, 3).map((tag: string, index: number) => (
                        <Badge key={index} variant="secondary" className="text-xs text-white bg-blue-600 hover:bg-blue-700">
                        {tag}
                      </Badge>
                    ))}
                    {creative.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs text-white bg-gray-600">
                        +{creative.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-2">
                  {creative.status === 'rendered' && creative.video_url && (
                    <>
                        <Button variant="ghost" size="sm" className="flex-1 hover:bg-blue-50 hover:text-blue-600">
                        <Play className="w-3 h-3 ml-1" />
                        צפה
                      </Button>
                        <Button variant="ghost" size="sm" className="hover:bg-green-50 hover:text-green-600">
                        <Download className="w-3 h-3" />
                      </Button>
                        <Button variant="ghost" size="sm" className="hover:bg-purple-50 hover:text-purple-600">
                        <Share2 className="w-3 h-3" />
                      </Button>
                    </>
                  )}
                    <Button variant="ghost" size="sm" className="hover:bg-orange-50 hover:text-orange-600">
                    <Edit className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="hover:bg-brand-primary hover:text-brand-light"
              >
                <ChevronLeft className="w-4 h-4 ml-1" />
                הקודם
              </Button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => goToPage(page)}
                  className={currentPage === page ? "bg-brand-primary text-white" : "hover:bg-brand-primary hover:text-brand-light"}
                >
                  {page}
                </Button>
              ))}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="hover:bg-brand-primary hover:text-brand-light"
              >
                הבא
                <ChevronRight className="w-4 h-4 mr-1" />
              </Button>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-right">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              מחק קריאייטיב
            </AlertDialogTitle>
            <AlertDialogDescription className="text-right">
              האם אתה בטוח שברצונך למחוק את הקריאייטיב "{creativeToDelete?.title}"? פעולה זו אינה הפיכה.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ביטול</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              מחק
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
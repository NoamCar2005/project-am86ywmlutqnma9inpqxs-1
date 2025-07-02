import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { 
  Plus, 
  TrendingUp, 
  Clock, 
  CreditCard,
  Play,
  Eye,
  Star
} from "lucide-react";
import { User } from "@/entities";
import { Project } from "@/entities";
import { Creative } from "@/entities";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [recentProjects, setRecentProjects] = useState<any[]>([]);
  const [recentCreatives, setRecentCreatives] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalCreatives: 0,
    creditsUsed: 0,
    creditsRemaining: 0
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);

      const projects = await Project.list('-created_at', 5);
      setRecentProjects(projects);

      const creatives = await Creative.list('-created_at', 6);
      setRecentCreatives(creatives);

      const allProjects = await Project.list();
      const allCreatives = await Creative.list();

      setStats({
        totalProjects: allProjects.length,
        totalCreatives: allCreatives.length,
        creditsUsed: currentUser.credits_used || 0,
        creditsRemaining: currentUser.credits_balance || 0
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'draft': { label: 'טיוטה', variant: 'secondary' as const },
      'planning': { label: 'בתכנון', variant: 'default' as const },
      'generating': { label: 'ביצירה', variant: 'default' as const },
      'completed': { label: 'הושלם', variant: 'default' as const },
      'failed': { label: 'נכשל', variant: 'destructive' as const },
      'rendered': { label: 'מוכן', variant: 'default' as const }
    };
    
    const config = statusMap[status as keyof typeof statusMap] || { label: status, variant: 'secondary' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              שלום, {user?.full_name || 'משתמש'}! 👋
            </h1>
            <p className="text-gray-600 mt-1">
              בואו ניצור תוכן מדהים יחד
            </p>
          </div>
        </div>
        <Button asChild size="lg" className="gradient-primary text-white">
          <Link to="/create">
            <Plus className="w-5 h-5 ml-2" />
            צור קריאייטיב חדש
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">פרויקטים כולל</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProjects}</div>
            <p className="text-xs text-muted-foreground">
              פרויקטים שנוצרו
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">קריאייטיבים</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCreatives}</div>
            <p className="text-xs text-muted-foreground">
              קריאייטיבים שנוצרו
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">קרדיטים בשימוש</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.creditsUsed}</div>
            <p className="text-xs text-muted-foreground">
              קרדיטים שנוצלו
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">קרדיטים נותרו</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.creditsRemaining}</div>
            <p className="text-xs text-muted-foreground">
              זמינים לשימוש
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              פרויקטים אחרונים
              <Link to="/history" className="text-sm text-blue-600 hover:underline">
                צפה בכל הפרויקטים
              </Link>
            </CardTitle>
            <CardDescription>
              הפרויקטים האחרונים שיצרת
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentProjects.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>עדיין לא יצרת פרויקטים</p>
                <Button asChild className="mt-4" variant="outline">
                  <Link to="/create">צור את הפרויקט הראשון שלך</Link>
                </Button>
              </div>
            ) : (
              recentProjects.map((project) => (
                <div key={project.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex-1">
                    <h4 className="font-medium">{project.title || project.brief}</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {new Date(project.created_at).toLocaleDateString('he-IL')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(project.status)}
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`/project/${project.id}`}>
                        <Eye className="w-4 h-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent Creatives */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              קריאייטיבים אחרונים
              <Link to="/history" className="text-sm text-blue-600 hover:underline">
                צפה בכל הקריאייטיבים
              </Link>
            </CardTitle>
            <CardDescription>
              הקריאייטיבים האחרונים שנוצרו
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentCreatives.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>עדיין לא נוצרו קריאייטיבים</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {recentCreatives.map((creative) => (
                  <div key={creative.id} className="relative group">
                    <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                      {creative.thumbnail_url ? (
                        <img 
                          src={creative.thumbnail_url} 
                          alt={creative.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Play className="w-8 h-8" />
                        </div>
                      )}
                    </div>
                    <div className="mt-2">
                      <h5 className="font-medium text-sm truncate">{creative.title}</h5>
                      <div className="flex items-center justify-between mt-1">
                        {getStatusBadge(creative.status)}
                        {creative.is_favorite && (
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
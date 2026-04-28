import { useState, useEffect } from 'react';
import { api, User, Team } from '@/lib/api';
import { UserAvatar } from '@/components/UserAvatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Users, Plus, Hash, Search, Building2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function TeamPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamDesc, setNewTeamDesc] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [teamsRes, usersRes] = await Promise.all([api.getTeams(), api.getUsers()]);
    if (teamsRes.data) setTeams(teamsRes.data.teams);
    if (usersRes.data) setAllUsers(usersRes.data.users);
  };

  const loadTeamMembers = async (team: Team) => {
    setSelectedTeam(team);
    const { data } = await api.getTeamMembers(team.id);
    if (data) setTeamMembers(data.members);
  };

  const createTeam = async () => {
    if (!newTeamName.trim()) return;
    const { error } = await api.createTeam(newTeamName, newTeamDesc, selectedMembers);
    if (!error) {
      setNewTeamName('');
      setNewTeamDesc('');
      setSelectedMembers([]);
      setMemberSearchQuery('');
      setIsCreateOpen(false);
      loadData();
    }
  };

  const toggleMember = (userId: number) => {
    setSelectedMembers(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const removeMember = (userId: number) => {
    setSelectedMembers(prev => prev.filter(id => id !== userId));
  };

  const filteredMembersForSelection = allUsers.filter(
    u =>
      u.full_name.toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
      u.username.toLowerCase().includes(memberSearchQuery.toLowerCase())
  );

  const filteredUsers = allUsers.filter(
    u =>
      u.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.department?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedUsers = filteredUsers.reduce((acc, user) => {
    const dept = user.department || 'Other';
    if (!acc[dept]) acc[dept] = [];
    acc[dept].push(user);
    return acc;
  }, {} as Record<string, User[]>);

  return (
    <div className="flex h-full">
      {/* Teams List */}
      <div className="w-80 border-r border-border bg-card p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-foreground">Your Teams</h2>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="ghost">
                <Plus className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Create a new team</DialogTitle>
                <DialogDescription>Teams help you organize communication</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Team name"
                  value={newTeamName}
                  onChange={e => setNewTeamName(e.target.value)}
                />
                <Input
                  placeholder="Description (optional)"
                  value={newTeamDesc}
                  onChange={e => setNewTeamDesc(e.target.value)}
                />
                
                {/* Selected Members */}
                {selectedMembers.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground">
                      Selected Members ({selectedMembers.length})
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedMembers.map(id => {
                        const user = allUsers.find(u => u.id === id);
                        if (!user) return null;
                        return (
                          <div
                            key={id}
                            className="flex items-center gap-1.5 bg-primary/10 text-primary rounded-full px-2 py-1 text-sm"
                          >
                            <span>{user.full_name}</span>
                            <button
                              onClick={() => removeMember(id)}
                              className="hover:bg-primary/20 rounded-full p-0.5"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Member Selection */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">Add Members</p>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search people..."
                      className="pl-10"
                      value={memberSearchQuery}
                      onChange={e => setMemberSearchQuery(e.target.value)}
                    />
                  </div>
                  <ScrollArea className="h-40 border border-border rounded-lg">
                    <div className="p-2 space-y-1">
                      {filteredMembersForSelection.map(user => (
                        <label
                          key={user.id}
                          className={cn(
                            'flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors',
                            selectedMembers.includes(user.id) ? 'bg-primary/10' : 'hover:bg-muted'
                          )}
                        >
                          <Checkbox
                            checked={selectedMembers.includes(user.id)}
                            onCheckedChange={() => toggleMember(user.id)}
                          />
                          <UserAvatar
                            name={user.full_name}
                            color={user.avatar_color}
                            isOnline={user.is_online}
                            size="sm"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{user.full_name}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {user.department}
                            </p>
                          </div>
                        </label>
                      ))}
                      {filteredMembersForSelection.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No users found
                        </p>
                      )}
                    </div>
                  </ScrollArea>
                </div>

                <Button onClick={createTeam} className="w-full gradient-primary">
                  Create Team
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <ScrollArea className="h-[calc(100vh-180px)]">
          <div className="space-y-1">
            {teams.map(team => (
              <button
                key={team.id}
                onClick={() => loadTeamMembers(team)}
                className={cn(
                  'w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors',
                  selectedTeam?.id === team.id ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
                )}
              >
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                  <Hash className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{team.name}</p>
                  <p className="text-sm text-muted-foreground">{team.member_count} members</p>
                </div>
              </button>
            ))}
            {teams.length === 0 && (
              <p className="text-center text-muted-foreground py-8 text-sm">
                No teams yet. Create one!
              </p>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-auto">
        {selectedTeam ? (
          <div>
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-foreground">{selectedTeam.name}</h1>
              <p className="text-muted-foreground">{selectedTeam.description || 'No description'}</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Team Members
                </CardTitle>
                <CardDescription>{teamMembers.length} members</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {teamMembers.map(member => (
                    <div
                      key={member.id}
                      className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 border border-border"
                    >
                      <UserAvatar
                        name={member.full_name}
                        color={member.avatar_color}
                        isOnline={member.is_online}
                        size="md"
                      />
                      <div>
                        <p className="font-medium text-foreground">{member.full_name}</p>
                        <p className="text-sm text-muted-foreground">{member.department}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-foreground">Organization</h1>
              <p className="text-muted-foreground">Browse your colleagues by department</p>
            </div>

            <div className="mb-4">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search people..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-6">
              {Object.entries(groupedUsers).map(([dept, users]) => (
                <Card key={dept}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Building2 className="w-5 h-5 text-primary" />
                      {dept}
                    </CardTitle>
                    <CardDescription>{users.length} people</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {users.map(u => (
                        <div
                          key={u.id}
                          className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 border border-border"
                        >
                          <UserAvatar
                            name={u.full_name}
                            color={u.avatar_color}
                            isOnline={u.is_online}
                            size="md"
                          />
                          <div>
                            <p className="font-medium text-foreground">{u.full_name}</p>
                            <p className="text-sm text-muted-foreground">@{u.username}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

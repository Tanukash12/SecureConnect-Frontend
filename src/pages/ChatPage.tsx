import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api, User, Team, Message, Conversation } from '@/lib/api';
import { socketClient } from '@/lib/socket';
import { UserAvatar } from '@/components/UserAvatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  MessageSquare,
  Users,
  Send,
  Plus,
  Search,
  Hash,
  Circle,
  X,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

export default function ChatPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeChat, setActiveChat] = useState<{ type: 'direct' | 'team'; id: number; name: string; avatar?: string; isOnline?: boolean } | null>(null);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamDesc, setNewTeamDesc] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const unsubMessage = socketClient.on('new_message', (data) => {
      const msg = data as Message;
      if (activeChat?.type === 'direct' && msg.sender_id === activeChat.id) {
        setMessages(prev => [...prev, msg]);
      }
    });

    const unsubTeamMessage = socketClient.on('new_team_message', (data) => {
      const msg = data as Message;
      if (activeChat?.type === 'team' && msg.team_id === activeChat.id) {
        setMessages(prev => [...prev, msg]);
      }
    });

    return () => {
      unsubMessage();
      unsubTeamMessage();
    };
  }, [activeChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadData = async () => {
    const [convRes, teamsRes, usersRes] = await Promise.all([
      api.getConversations(),
      api.getTeams(),
      api.getUsers(),
    ]);

    if (convRes.data) setConversations(convRes.data.conversations);
    if (teamsRes.data) setTeams(teamsRes.data.teams);
    if (usersRes.data) setAllUsers(usersRes.data.users);
  };

  const loadMessages = async (type: 'direct' | 'team', id: number) => {
    if (type === 'direct') {
      const { data } = await api.getDirectMessages(id);
      if (data) setMessages(data.messages);
    } else {
      const { data } = await api.getTeamMessages(id);
      if (data) setMessages(data.messages);
      socketClient.joinTeam(id);
    }
  };

  const selectChat = async (type: 'direct' | 'team', id: number, name: string, avatar?: string, isOnline?: boolean) => {
    if (activeChat?.type === 'team' && activeChat.id !== id) {
      socketClient.leaveTeam(activeChat.id);
    }
    setActiveChat({ type, id, name, avatar, isOnline });
    await loadMessages(type, id);
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !activeChat || !user) return;

    socketClient.sendMessage({
      sender_id: user.id,
      receiver_id: activeChat.type === 'direct' ? activeChat.id : undefined,
      team_id: activeChat.type === 'team' ? activeChat.id : undefined,
      content: newMessage,
    });

    // Optimistically add message
    setMessages(prev => [
      ...prev,
      {
        id: Date.now(),
        sender_id: user.id,
        sender_name: user.full_name,
        sender_username: user.username,
        sender_avatar: user.avatar_color,
        content: newMessage,
        timestamp: new Date().toISOString(),
      },
    ]);

    setNewMessage('');
  };

  const createTeam = async () => {
    if (!newTeamName.trim()) return;
    const { error } = await api.createTeam(newTeamName, newTeamDesc, selectedMembers);
    if (!error) {
      setNewTeamName('');
      setNewTeamDesc('');
      setSelectedMembers([]);
      setMemberSearchQuery('');
      setIsCreateTeamOpen(false);
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

  const startNewConversation = async (targetUser: User) => {
    await selectChat('direct', targetUser.id, targetUser.full_name, targetUser.avatar_color, targetUser.is_online);
  };

  const filteredUsers = allUsers.filter(u => 
    u.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredMembersForSelection = allUsers.filter(
    u =>
      u.full_name.toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
      u.username.toLowerCase().includes(memberSearchQuery.toLowerCase())
  );

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-80 border-r border-border bg-card flex flex-col">
        <div className="p-4 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              className="pl-10"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <Tabs defaultValue="chats" className="flex-1 flex flex-col">
          <TabsList className="grid grid-cols-3 mx-4 mt-2">
            <TabsTrigger value="chats">Chats</TabsTrigger>
            <TabsTrigger value="teams">Teams</TabsTrigger>
            <TabsTrigger value="people">People</TabsTrigger>
          </TabsList>

          {/* Direct Chats */}
          <TabsContent value="chats" className="flex-1 m-0">
            <ScrollArea className="h-[calc(100vh-200px)]">
              <div className="p-2 space-y-1">
                {conversations.map(conv => (
                  <button
                    key={conv.user.id}
                    onClick={() => selectChat('direct', conv.user.id, conv.user.full_name, conv.user.avatar_color, conv.user.is_online)}
                    className={cn(
                      'w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors',
                      activeChat?.id === conv.user.id && activeChat?.type === 'direct'
                        ? 'bg-primary/10 text-primary'
                        : 'hover:bg-muted'
                    )}
                  >
                    <UserAvatar
                      name={conv.user.full_name}
                      color={conv.user.avatar_color}
                      isOnline={conv.user.is_online}
                      size="md"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium truncate">{conv.user.full_name}</p>
                        {conv.unread_count > 0 && (
                          <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                            {conv.unread_count}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{conv.last_message.content}</p>
                    </div>
                  </button>
                ))}
                {conversations.length === 0 && (
                  <p className="text-center text-muted-foreground py-8 text-sm">No conversations yet</p>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Teams */}
          <TabsContent value="teams" className="flex-1 m-0">
            <ScrollArea className="h-[calc(100vh-200px)]">
              <div className="p-2 space-y-1">
                <Dialog open={isCreateTeamOpen} onOpenChange={setIsCreateTeamOpen}>
                  <DialogTrigger asChild>
                    <button className="w-full flex items-center gap-3 p-3 rounded-lg text-left hover:bg-muted text-primary">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Plus className="w-5 h-5" />
                      </div>
                      <span className="font-medium">Create Team</span>
                    </button>
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
                              const userMember = allUsers.find(u => u.id === id);
                              if (!userMember) return null;
                              return (
                                <div
                                  key={id}
                                  className="flex items-center gap-1.5 bg-primary/10 text-primary rounded-full px-2 py-1 text-sm"
                                >
                                  <span>{userMember.full_name}</span>
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
                            {filteredMembersForSelection.map(userItem => (
                              <label
                                key={userItem.id}
                                className={cn(
                                  'flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors',
                                  selectedMembers.includes(userItem.id) ? 'bg-primary/10' : 'hover:bg-muted'
                                )}
                              >
                                <Checkbox
                                  checked={selectedMembers.includes(userItem.id)}
                                  onCheckedChange={() => toggleMember(userItem.id)}
                                />
                                <UserAvatar
                                  name={userItem.full_name}
                                  color={userItem.avatar_color}
                                  isOnline={userItem.is_online}
                                  size="sm"
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{userItem.full_name}</p>
                                  <p className="text-xs text-muted-foreground truncate">
                                    {userItem.department}
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

                {teams.map(team => (
                  <button
                    key={team.id}
                    onClick={() => selectChat('team', team.id, team.name)}
                    className={cn(
                      'w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors',
                      activeChat?.id === team.id && activeChat?.type === 'team'
                        ? 'bg-primary/10 text-primary'
                        : 'hover:bg-muted'
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
              </div>
            </ScrollArea>
          </TabsContent>

          {/* People */}
          <TabsContent value="people" className="flex-1 m-0">
            <ScrollArea className="h-[calc(100vh-200px)]">
              <div className="p-2 space-y-1">
                {filteredUsers.map(u => (
                  <button
                    key={u.id}
                    onClick={() => startNewConversation(u)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg text-left hover:bg-muted transition-colors"
                  >
                    <UserAvatar
                      name={u.full_name}
                      color={u.avatar_color}
                      isOnline={u.is_online}
                      size="md"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{u.full_name}</p>
                      <p className="text-sm text-muted-foreground">{u.department}</p>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {activeChat ? (
          <>
            {/* Header */}
            <div className="h-16 border-b border-border flex items-center justify-between px-6 bg-card">
              <div className="flex items-center gap-3">
                {activeChat.type === 'direct' ? (
                  <UserAvatar
                    name={activeChat.name}
                    color={activeChat.avatar}
                    isOnline={activeChat.isOnline}
                    size="md"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                    <Hash className="w-5 h-5" />
                  </div>
                )}
                <div>
                  <p className="font-semibold text-foreground">{activeChat.name}</p>
                  {activeChat.type === 'direct' && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Circle className={cn('w-2 h-2', activeChat.isOnline ? 'fill-success text-success' : 'fill-muted-foreground')} />
                      {activeChat.isOnline ? 'Online' : 'Offline'}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-6">
              <div className="space-y-4 max-w-3xl mx-auto">
                {messages.map((msg, idx) => {
                  const isOwn = msg.sender_id === user?.id;
                  return (
                    <div
                      key={msg.id || idx}
                      className={cn('flex gap-3', isOwn && 'flex-row-reverse')}
                    >
                      <UserAvatar
                        name={isOwn ? user?.full_name || '' : msg.sender_name || msg.sender_username || 'Unknown'}
                        color={isOwn ? user?.avatar_color : msg.sender_avatar}
                        size="sm"
                      />
                      <div className={cn('max-w-[70%]', isOwn && 'text-right')}>
                        <div className="flex items-center gap-2 mb-1">
                          {!isOwn && (
                            <span className="text-sm font-medium text-foreground">
                              {msg.sender_name || msg.sender_username}
                            </span>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(msg.timestamp), { addSuffix: true })}
                          </span>
                        </div>
                        <div
                          className={cn(
                            'inline-block p-3 rounded-2xl',
                            isOwn
                              ? 'gradient-primary text-primary-foreground rounded-tr-md'
                              : 'bg-muted text-foreground rounded-tl-md'
                          )}
                        >
                          {msg.content}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t border-border bg-card">
              <div className="flex gap-3 max-w-3xl mx-auto">
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  className="flex-1"
                />
                <Button onClick={sendMessage} className="gradient-primary">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-10 h-10 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">Select a conversation</h2>
              <p className="text-muted-foreground">Choose a chat or team to start messaging</p>
            </div>
          </div>
        )}
      </div>
     
    </div>
  );
}
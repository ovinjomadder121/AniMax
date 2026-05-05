import React, { useState, useEffect } from 'react';
import { auth, db, googleProvider, signInWithPopup, onAuthStateChanged, isUserAdmin, collection, addDoc, deleteDoc, doc, query, orderBy, onSnapshot, serverTimestamp } from '../lib/firebase';
import { User } from 'firebase/auth';
import { Photo } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { LogIn, LogOut, Plus, Trash2, Upload, AlertCircle, CheckCircle2, Loader2, Image as ImageIcon } from 'lucide-react';

export default function Admin() {
  const [user, setUser] = useState<User | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });

    const q = query(collection(db, 'photos'), orderBy('createdAt', 'desc'));
    const unsubPhotos = onSnapshot(q, (snapshot) => {
      const photoList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Photo[];
      setPhotos(photoList);
      setLoading(false);
    });

    return () => {
      unsubAuth();
      unsubPhotos();
    };
  }, []);

  const login = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error("Login failed", err);
      setError("Failed to sign in. Please try again.");
    }
  };

  const logout = () => auth.signOut();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 800000) { // ~800KB limit for Firestore Base64
      setError("Image too large. Please use a smaller file or a URL (limit 800KB for direct upload).");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setImagePreview(base64String);
      setImageUrl(base64String);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isUserAdmin(user)) return;
    if (!imageUrl || !title) {
      setError("Please provide a title and an image.");
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const tagArray = tags.split(',').map(t => t.trim().toLowerCase().replace('#', '')).filter(t => t !== '');
      
      await addDoc(collection(db, 'photos'), {
        url: imageUrl,
        title,
        description,
        tags: tagArray,
        views: 0,
        createdAt: serverTimestamp(),
        size: imageUrl.length
      });
      
      setSuccess("Photo added successfully!");
      setTitle('');
      setDescription('');
      setTags('');
      setImageUrl('');
      setImagePreview(null);
    } catch (err) {
      console.error("Upload error", err);
      setError("Failed to upload. Check console for details.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!isUserAdmin(user)) return;
    if (!confirm("Are you sure you want to delete this photo?")) return;

    try {
      await deleteDoc(doc(db, 'photos', id));
      setSuccess("Photo deleted.");
    } catch (err) {
      setError("Delete failed.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-white/20" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/5 border border-white/10 p-12 rounded-3xl text-center max-w-md w-full"
        >
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6 text-white/40">
            <LogIn size={32} />
          </div>
          <h2 className="text-3xl font-display mb-2">Admin Portal</h2>
          <p className="text-white/40 mb-8 font-light">Access is restricted to the administrator only.</p>
          <button 
            onClick={login}
            className="w-full py-4 bg-white text-black rounded-xl font-medium hover:bg-white/90 transition-colors flex items-center justify-center gap-3"
          >
            Sign in with Google
          </button>
        </motion.div>
      </div>
    );
  }

  if (!isUserAdmin(user)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500/50 mx-auto mb-6" />
          <h2 className="text-3xl font-display mb-4">Access Denied</h2>
          <p className="text-white/40 mb-8 max-w-sm font-light">
            You are signed in as <span className="text-white">{user.email}</span>, which does not have administrative privileges.
          </p>
          <button 
            onClick={logout}
            className="px-8 py-3 border border-white/20 rounded-full hover:bg-white/5 transition-colors flex items-center gap-2 mx-auto"
          >
            <LogOut size={20} />
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-12 max-w-7xl mx-auto">
      <div className="flex justify-between items-end mb-12">
        <div>
          <h2 className="text-4xl font-display font-light">Dashboard</h2>
          <p className="text-white/40">Welcome back, Admin.</p>
        </div>
        <button 
          onClick={logout}
          className="text-white/40 hover:text-white transition-colors flex items-center gap-2 text-sm uppercase tracking-widest"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Upload Form */}
        <div className="lg:col-span-1">
          <div className="bg-white/5 border border-white/10 p-8 rounded-2xl sticky top-24">
            <h3 className="text-xl font-medium mb-6 flex items-center gap-2">
              <Plus size={20} className="text-white/40" />
              Upload New Photo
            </h3>
            
            <form onSubmit={handleUpload} className="space-y-6">
              <div>
                <label className="block text-xs uppercase tracking-widest text-white/40 mb-2">Title</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-white/40 transition-colors"
                  placeholder="Beach Sunset"
                  required
                />
              </div>
              
              <div>
                <label className="block text-xs uppercase tracking-widest text-white/40 mb-2">Description (Optional)</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-white/40 transition-colors resize-none h-20"
                  placeholder="Vibrant orange skies over the ocean..."
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest text-white/40 mb-2">Tags (Comma separated)</label>
                <input 
                  type="text" 
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-white/40 transition-colors"
                  placeholder="naruto, anime, wallpaper, blue"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest text-white/40 mb-2">Image Source</label>
                <div className="grid grid-cols-1 gap-4">
                   <div className="relative border-2 border-dashed border-white/10 rounded-lg p-4 transition-colors hover:border-white/20">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex flex-col items-center justify-center gap-2 text-white/20">
                      <ImageIcon size={24} />
                      <span className="text-sm">Click or drag image</span>
                    </div>
                  </div>
                  
                  <div className="text-center text-[10px] text-white/20 uppercase">Or Paste URL</div>
                  
                  <input 
                    type="url" 
                    value={imageUrl}
                    onChange={(e) => {
                      setImageUrl(e.target.value);
                      setImagePreview(e.target.value);
                    }}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-white/40 transition-colors"
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>
              </div>

              {imagePreview && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative aspect-video rounded-lg overflow-hidden border border-white/10"
                >
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <button 
                    type="button"
                    onClick={() => {
                      setImagePreview(null);
                      setImageUrl('');
                    }}
                    className="absolute top-2 right-2 p-1 bg-black/60 rounded-full text-white/60 hover:text-white"
                  >
                    <Plus size={16} className="rotate-45" />
                  </button>
                </motion.div>
              )}

              <AnimatePresence>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-2 text-red-400 text-sm bg-red-400/10 p-3 rounded-lg"
                  >
                    <AlertCircle size={16} />
                    {error}
                  </motion.div>
                )}
                {success && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-2 text-green-400 text-sm bg-green-400/10 p-3 rounded-lg"
                  >
                    <CheckCircle2 size={16} />
                    {success}
                  </motion.div>
                )}
              </AnimatePresence>

              <button 
                type="submit"
                disabled={uploading}
                className="w-full py-4 bg-white text-black rounded-xl font-medium hover:bg-white/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Upload size={20} />
                    Upload Photo
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* List of Photos */}
        <div className="lg:col-span-2">
          <h3 className="text-xl font-medium mb-6 flex items-center gap-2">
            <ImageIcon size={20} className="text-white/40" />
            Manage Gallery ({photos.length})
          </h3>
          
          <div className="space-y-4">
            {photos.map((photo) => (
              <div 
                key={photo.id}
                className="flex items-center gap-6 bg-white/5 border border-white/10 p-4 rounded-xl group"
              >
                <div className="w-24 h-16 rounded-lg overflow-hidden flex-shrink-0">
                  <img src={photo.url} alt={photo.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium truncate">{photo.title}</h4>
                  <p className="text-xs text-white/40 truncate">{new Date(photo.createdAt?.seconds * 1000).toLocaleDateString()}</p>
                </div>
                <button 
                  onClick={() => handleDelete(photo.id)}
                  className="p-2 text-white/20 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
            {photos.length === 0 && (
              <div className="py-20 text-center border border-dashed border-white/10 rounded-2xl">
                <p className="text-white/20 italic">No photos found.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/client";

const STORAGE_KEY = "tripez-documents";
const STORAGE_BUCKET = "user-files";
const MAX_FILE_SIZE_BYTES = 1024 * 1024;

// Category List Config
const CATEGORIES = [
  { id: "all", label: "All Items" },
  { id: "identity", label: "Identity & Visas" },
  { id: "transit", label: "Transit & Flights" },
  { id: "lodging", label: "Hotels & Lodging" },
  { id: "other", label: "Other Receipts" }
];

const CategoryIcon = ({ id, className = "h-4 w-4" }) => {
  if (id === "identity") {
    return (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    );
  }
  if (id === "transit") {
    return (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
      </svg>
    );
  }
  if (id === "lodging") {
    return (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    );
  }
  if (id === "other") {
    return (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    );
  }
  // Default is "all" or generic folder icon
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  );
};

// Inline SVG Icon components for unified sidebar navigation
const LogoIcon = () => (
  <svg className="h-6 w-6 text-sky-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
  </svg>
);

const DashboardIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="9" rx="1.5" />
    <rect x="14" y="3" width="7" height="5" rx="1.5" />
    <rect x="14" y="12" width="7" height="9" rx="1.5" />
    <rect x="3" y="16" width="7" height="5" rx="1.5" />
  </svg>
);

const DocumentIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

const ExpenseIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);

const CollabIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const LogoutIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const CloseIcon = () => (
  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const MenuIcon = () => (
  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const getInitials = (name) => {
  if (!name) return "TE";
  const parts = name.split(" ").filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return parts[0] ? parts[0][0].toUpperCase() : "TE";
};

const getStorageKey = (userId) => (userId ? `${STORAGE_KEY}-${userId}` : STORAGE_KEY);

const getStoragePathFromUrl = (fileUrl) => {
  if (!fileUrl) return null;

  try {
    const url = new URL(fileUrl);
    const pathParts = url.pathname.split("/").filter(Boolean);
    const publicIndex = pathParts.findIndex((part) => part === "public");

    if (publicIndex >= 0 && pathParts[publicIndex + 1] === STORAGE_BUCKET) {
      return pathParts.slice(publicIndex + 2).join("/");
    }
  } catch {
    return null;
  }

  return null;
};

// Preset checklist templates to guide user vaults
const starterDocuments = [
  { id: "doc-1", title: "Passport Copy", category: "identity", fileName: "", fileUrl: "", fileType: "" },
  { id: "doc-2", title: "Flight E-Ticket", category: "transit", fileName: "", fileUrl: "", fileType: "" },
  { id: "doc-3", title: "Hotel Booking Voucher", category: "lodging", fileName: "", fileUrl: "", fileType: "" },
  { id: "doc-4", title: "Travel Insurance", category: "other", fileName: "", fileUrl: "", fileType: "" }
];

const generateUniqueId = () => Date.now().toString();
const generateStoragePath = (userId, safeFileName) => `${userId}/${Date.now()}-${safeFileName}`;

const persistDocumentsData = async (userId, nextDocuments) => {
  if (typeof window !== "undefined" && userId) {
    window.localStorage.setItem(getStorageKey(userId), JSON.stringify(nextDocuments));
    if (supabase) {
      try {
        await supabase.auth.updateUser({
          data: { documents: nextDocuments },
        });
      } catch (error) {
        console.error("Failed to sync documents metadata with Supabase Auth:", error);
      }
    }
  }
};

export default function DocumentsPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState([]);
  const [form, setForm] = useState({ title: "", category: "identity", file: null });
  const [uploadMessage, setUploadMessage] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadingDocumentId, setUploadingDocumentId] = useState(null);
  
  const [userId, setUserId] = useState("");
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedCategoryTab, setSelectedCategoryTab] = useState("all");
  const [expandedPreviews, setExpandedPreviews] = useState({});

  const togglePreview = (docId) => {
    setExpandedPreviews((current) => ({
      ...current,
      [docId]: !current[docId]
    }));
  };

  useEffect(() => {
    if (!loading && userId) {
      persistDocumentsData(userId, documents);
    }
  }, [documents, userId, loading]);

  useEffect(() => {
    const loadSession = async () => {
      if (!supabase) {
        setUploadMessage("Supabase is not configured yet. Add your credentials to upload files.");
        setLoading(false);
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        router.replace("/login");
        return;
      }

      const currentUserId = session.user.id;
      const profileName = session.user?.user_metadata?.full_name || session.user?.email || "your account";
      setUserId(currentUserId);
      setUserName(profileName);

      // Try reading from user metadata first
      let userMetadataDocs = session.user?.user_metadata?.documents;
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.user_metadata?.documents) {
          userMetadataDocs = user.user_metadata.documents;
        }
      } catch (err) {
        console.error("Failed to fetch fresh user metadata:", err);
      }

      if (userMetadataDocs && Array.isArray(userMetadataDocs)) {
        setDocuments(userMetadataDocs);
        setLoading(false);
        return;
      }

      if (typeof window !== "undefined") {
        const userStorageKey = getStorageKey(currentUserId);
        const fallbackStorageKey = STORAGE_KEY;
        const savedDocuments = window.localStorage.getItem(userStorageKey) || window.localStorage.getItem(fallbackStorageKey);
        if (savedDocuments) {
          try {
            const parsedDocuments = JSON.parse(savedDocuments);
            if (parsedDocuments?.length) {
              setDocuments(parsedDocuments);
              // Migrate local documents to Supabase user_metadata immediately
              await supabase.auth.updateUser({
                data: { documents: parsedDocuments }
              });
              setLoading(false);
              return;
            }
          } catch {
            window.localStorage.removeItem(userStorageKey);
            window.localStorage.removeItem(fallbackStorageKey);
          }
        }
      }

      setDocuments(starterDocuments);
      setLoading(false);
    };

    loadSession();
  }, [router]);

  const uploadFileToDocument = async (file, documentId) => {
    const isPdf = file.type === "application/pdf";
    const isImage = file.type.startsWith("image/");

    if (!isPdf && !isImage) {
      setUploadMessage("Please upload an image or a PDF file.");
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setUploadMessage("This file is larger than 1MB. Please choose a smaller file.");
      return;
    }

    if (!supabase) {
      setUploadMessage("Supabase is not configured yet. Add your credentials to upload files.");
      return;
    }

    if (!userId) {
      setUploadMessage("Please sign in again to upload files.");
      return;
    }

    setUploadingDocumentId(documentId);
    setUploadProgress(10);
    setUploadMessage("Uploading file...");

    const safeFileName = file.name.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9._-]/g, "");
    const storagePath = generateStoragePath(userId, safeFileName);

    try {
      const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(storagePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

      if (error) {
        throw error;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(storagePath);

      setUploadProgress(100);
      setDocuments((currentDocuments) =>
        currentDocuments.map((document) =>
          document.id === documentId ? { ...document, fileName: file.name, fileUrl: publicUrl, fileType: file.type, storagePath } : document
        )
      );
      setUploadMessage(`Upload complete: ${file.name}`);
    } catch (error) {
      const message = error?.message || "Unknown upload error";
      if (message.includes("row-level security") || message.includes("policy")) {
        setUploadMessage(
          `Upload is blocked by Supabase Storage policies. In Supabase, allow authenticated users to upload to the "${STORAGE_BUCKET}" bucket, then try again.`
        );
      } else {
        setUploadMessage(`Upload failed: ${message}. Make sure the "${STORAGE_BUCKET}" bucket exists and is accessible.`);
      }
    } finally {
      setUploadingDocumentId(null);
      setUploadProgress(0);
    }
  };

  const handleAddDocument = async (event) => {
    event.preventDefault();

    if (!form.title.trim()) {
      setUploadMessage("Please give your document a title.");
      return;
    }

    const documentTitle = form.title.trim();
    const selectedFile = form.file;
    const newDocument = {
      id: generateUniqueId(),
      title: documentTitle,
      category: form.category,
      fileName: "",
      fileUrl: "",
      fileType: "",
    };

    setDocuments((currentDocuments) => [newDocument, ...currentDocuments]);
    setForm({ title: "", category: "identity", file: null });

    if (selectedFile) {
      await uploadFileToDocument(selectedFile, newDocument.id);
    } else {
      setUploadMessage(`Document saved: ${documentTitle}`);
    }
  };

  const handleFileUpload = async (event, documentId) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await uploadFileToDocument(file, documentId);
  };

  const handleDeleteDocument = async (documentId) => {
    const documentToDelete = documents.find((document) => document.id === documentId);
    const confirmed = window.confirm(`Delete "${documentToDelete?.title || "this document"}"?`);
    if (!confirmed) return;

    const storagePath = documentToDelete?.storagePath || getStoragePathFromUrl(documentToDelete?.fileUrl);

    if (storagePath && supabase) {
      try {
        await supabase.storage.from(STORAGE_BUCKET).remove([storagePath]);
      } catch (error) {
        console.error("Failed to remove stored document file", error);
      }
    }

    setDocuments((currentDocuments) => currentDocuments.filter((document) => document.id !== documentId));
    setUploadMessage(documentToDelete?.title ? `${documentToDelete.title} was removed.` : "Document removed.");
  };

  const handleViewDocument = (document) => {
    if (document?.fileUrl) {
      window.open(document.fileUrl, "_blank", "noopener,noreferrer");
    }
  };

  const handleSignOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    router.replace("/");
  };

  // Filtered documents calculation
  const filteredDocuments = useMemo(() => {
    if (selectedCategoryTab === "all") return documents;
    return documents.filter(doc => doc.category === selectedCategoryTab);
  }, [documents, selectedCategoryTab]);




  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[linear-gradient(135deg,_#f8fbff_0%,_#eef6ff_50%,_#ffffff_100%)] text-slate-900 font-sans">
        <div className="relative flex flex-col items-center gap-4">
          <svg className="animate-spin h-8 w-8 text-sky-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-xs font-bold tracking-wide text-slate-500 uppercase tracking-widest animate-pulse">Loading vault...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[linear-gradient(135deg,_#f8fbff_0%,_#eef6ff_50%,_#ffffff_100%)] text-slate-900 font-sans antialiased overflow-x-hidden w-full">
      
      {/* DESKTOP SIDEBAR NAVIGATION */}
      <aside className="hidden md:flex flex-col justify-between fixed top-0 bottom-0 left-0 w-64 bg-white/70 border-r border-slate-200/60 backdrop-blur-md p-6 z-30">
        <div className="space-y-8">
          <Link href="/dashboard" className="flex items-center gap-3 px-2 hover:opacity-85 transition-opacity">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg shadow-sky-100">
              <LogoIcon />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 font-sans">TripEZ</span>
          </Link>

          <nav className="space-y-1.5 font-sans">
            <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-600 hover:text-slate-900 hover:bg-slate-50/50 transition-all duration-200">
              <DashboardIcon />
              <span className="text-sm">Dashboard</span>
            </Link>
            
            <Link href="/documents" className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-sky-50 text-sky-700 font-semibold border border-sky-100/50 transition-all duration-200">
              <DocumentIcon />
              <span className="text-sm">Document Vault</span>
            </Link>

            <Link href="/expenses" className="flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-600 hover:text-slate-900 hover:bg-slate-50/50 transition-all duration-200">
              <ExpenseIcon />
              <span className="text-sm">Expense Tracker</span>
            </Link>

            <Link href="/trip-collab" className="flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-600 hover:text-slate-900 hover:bg-slate-50/50 transition-all duration-200">
              <CollabIcon />
              <span className="text-sm">Collaboration</span>
            </Link>
          </nav>
        </div>

        {/* User profile bottom item */}
        <div className="pt-4 border-t border-slate-200/60 flex items-center justify-between gap-3 font-sans">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-sky-400 to-indigo-500 text-sm font-bold text-white shadow-md">
              {getInitials(userName)}
            </div>
            <div className="overflow-hidden">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Traveler</p>
              <p className="text-sm font-bold text-slate-900 truncate" title={userName}>{userName}</p>
            </div>
          </div>
          <button 
            onClick={handleSignOut}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
            title="Sign Out"
          >
            <LogoutIcon />
          </button>
        </div>
      </aside>

      {/* MOBILE HEADER BAR */}
      <header className="flex md:hidden items-center justify-between px-6 py-4 bg-white/70 border-b border-slate-200/60 backdrop-blur-md fixed top-0 left-0 right-0 z-40">
        <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-85 transition-opacity">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white shadow-md">
            <LogoIcon />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900">TripEZ</span>
        </Link>
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <MenuIcon />
        </button>
      </header>

      {/* MOBILE DRAWER OVERLAY */}
      <div className={`fixed inset-0 z-50 transition-all duration-300 md:hidden ${isSidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
        <div 
          className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs"
          onClick={() => setIsSidebarOpen(false)}
        />
        <div className={`absolute top-0 bottom-0 left-0 w-72 bg-white p-6 shadow-2xl flex flex-col justify-between transform transition-transform duration-300 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <Link href="/dashboard" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-3 hover:opacity-85 transition-opacity">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-md">
                  <LogoIcon />
                </div>
                <span className="text-xl font-bold tracking-tight text-slate-900">TripEZ</span>
              </Link>
              <button 
                onClick={() => setIsSidebarOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition-colors"
              >
                <CloseIcon />
              </button>
            </div>

            <nav className="space-y-1.5">
              <Link href="/dashboard" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-600 hover:text-slate-900 hover:bg-slate-50/50 transition-all duration-200">
                <DashboardIcon />
                <span className="text-sm">Dashboard</span>
              </Link>
              
              <Link href="/documents" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-sky-50 text-sky-700 font-semibold border border-sky-100/50 transition-all duration-200">
                <DocumentIcon />
                <span className="text-sm">Document Vault</span>
              </Link>

              <Link href="/expenses" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-600 hover:text-slate-900 hover:bg-slate-50/50 transition-all duration-200">
                <ExpenseIcon />
                <span className="text-sm">Expense Tracker</span>
              </Link>

              <Link href="/trip-collab" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-600 hover:text-slate-900 hover:bg-slate-50/50 transition-all duration-200">
                <CollabIcon />
                <span className="text-sm">Collaboration</span>
              </Link>
            </nav>
          </div>

          <div className="pt-4 border-t border-slate-200/60 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-sky-400 to-indigo-500 text-sm font-bold text-white shadow-md">
                {getInitials(userName)}
              </div>
              <div className="overflow-hidden">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Traveler</p>
                <p className="text-sm font-bold text-slate-900 truncate">{userName}</p>
              </div>
            </div>
            <button 
              onClick={handleSignOut}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <LogoutIcon />
            </button>
          </div>
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <main className="flex-1 md:pl-64 pt-20 md:pt-0 min-h-screen">
        <div className="px-4 py-8 sm:px-6 sm:py-16">
          <div className="mx-auto max-w-6xl space-y-8">
            
            {/* Header section */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-slate-200/60">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 border border-sky-100 text-sky-600 shadow-inner text-xl">
                  📄
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-sky-700">Secure Cabinet</p>
                  <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Document Vault</h1>
                </div>
              </div>
            </div>

            {/* CATEGORY SELECTOR GRID */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 w-full">
              {CATEGORIES.map((cat) => {
                const isActive = selectedCategoryTab === cat.id;
                // Calculate item count in this category
                const count = cat.id === "all" 
                  ? documents.length 
                  : documents.filter(d => d.category === cat.id).length;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategoryTab(cat.id)}
                    className={`flex flex-col items-center justify-center p-5 rounded-2xl border text-center transition-all duration-300 cursor-pointer w-full group relative overflow-hidden ${
                      isActive
                        ? "border-sky-500 bg-sky-600 text-white shadow-lg shadow-sky-100"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-350 hover:bg-slate-50/80"
                    }`}
                  >
                    <div className={`p-3 rounded-xl mb-3 transition-colors ${
                      isActive 
                        ? "bg-white/10 text-white" 
                        : "bg-slate-50 text-slate-500 group-hover:bg-sky-50 group-hover:text-sky-600"
                    }`}>
                      <CategoryIcon id={cat.id} className="h-6 w-6" />
                    </div>
                    
                    <span className="text-xs font-bold tracking-tight block leading-tight">{cat.label}</span>
                    
                    <span className={`mt-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-[9px] font-bold ${
                      isActive 
                        ? "bg-white/20 text-white" 
                        : "bg-slate-100 text-slate-400 group-hover:bg-sky-50/70 group-hover:text-sky-700"
                    }`}>
                      {count} {count === 1 ? "item" : "items"}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Primary Workspace Grid */}
            <div className="grid gap-8 lg:grid-cols-[1fr_1.3fr] items-start w-full">
              
              {/* Add Document Form */}
              <section className="space-y-6 w-full">
                <form onSubmit={handleAddDocument} className="space-y-5 rounded-2xl sm:rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xl shadow-sky-100/30 w-full">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 tracking-tight">Catalog Document</h2>
                    <p className="text-xs text-slate-500 mt-1">Specify files and catalog details to secure in the cloud vault.</p>
                  </div>

                  {/* Title */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">Document Title</label>
                    <div className="relative rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus-within:bg-white focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-100/60 transition-all duration-200">
                      <span className="absolute left-4 top-3.5 text-slate-400">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </span>
                      <input
                        value={form.title}
                        onChange={(event) => setForm((currentForm) => ({ ...currentForm, title: event.target.value }))}
                        className="w-full pl-11 pr-4 py-3 bg-transparent text-sm text-slate-900 outline-none placeholder-slate-400"
                        placeholder="e.g. Passport Copy, Boarding Pass"
                      />
                    </div>
                  </div>

                  {/* Category Selection */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">Category</label>
                    <div className="relative rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus-within:bg-white focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-100/60 transition-all duration-200">
                      <span className="absolute left-4 top-3.5 text-slate-400">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                        </svg>
                      </span>
                      <select
                        value={form.category}
                        onChange={(event) => setForm((currentForm) => ({ ...currentForm, category: event.target.value }))}
                        className="w-full pl-11 pr-10 py-3 bg-transparent text-sm text-slate-900 outline-none appearance-none cursor-pointer"
                      >
                        {CATEGORIES.slice(1).map((cat) => (
                          <option key={cat.id} value={cat.id}>{cat.label}</option>
                        ))}
                      </select>
                      <span className="absolute right-4 top-4 text-slate-400 pointer-events-none">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </span>
                    </div>
                  </div>

                  {/* Browse File Dropzone style */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">Attach File (Optional)</label>
                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 hover:border-sky-400 bg-slate-50/30 hover:bg-sky-50/10 rounded-2xl px-6 py-6 transition cursor-pointer text-center group">
                      <svg className="h-6 w-6 text-slate-400 mb-1.5 opacity-75 group-hover:scale-105 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      <span className="text-xs font-bold text-slate-700 truncate max-w-[200px] mb-1">
                        {form.file ? form.file.name : "Select image or PDF (Max 1MB)..."}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400">click to search locally</span>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(event) => setForm((currentForm) => ({ ...currentForm, file: event.target.files?.[0] || null }))}
                        className="sr-only"
                      />
                    </label>
                    {form.file ? (
                      <p className="mt-2 text-[10px] font-bold text-sky-700 flex items-center gap-1 px-1">
                        <span>✓ File selected:</span>
                        <span className="truncate max-w-[240px]">{form.file.name}</span>
                      </p>
                    ) : null}
                  </div>

                  {uploadMessage ? (
                    <p className="rounded-2xl bg-sky-50 border border-sky-100 px-4 py-3 text-xs text-sky-700 animate-fade-in font-semibold">{uploadMessage}</p>
                  ) : null}

                  <button 
                    type="submit" 
                    className="w-full rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 py-3.5 text-xs font-bold text-white shadow-lg shadow-sky-100 transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer"
                  >
                    Save & Catalog Document
                  </button>
                </form>
              </section>

              {/* Saved Documents Vault List */}
              <section className="space-y-6 w-full">
                <div className="space-y-5 rounded-2xl sm:rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xl shadow-slate-200/30 flex flex-col justify-between min-h-[300px] w-full">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                      Filing Cabinet
                      <span className="bg-sky-50 border border-sky-100 text-sky-700 px-2 py-0.5 rounded-full text-xs font-bold shadow-xs">
                        {filteredDocuments.length}
                      </span>
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">Cataloged travel vouchers and identification papers.</p>
                  </div>

                  {loading ? (
                    <div className="flex-1 flex items-center justify-center py-12">
                      <div className="text-center space-y-3">
                        <svg className="animate-spin h-6 w-6 text-sky-600 mx-auto" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest animate-pulse">Loading cabinet...</p>
                      </div>
                    </div>
                  ) : filteredDocuments.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-16 text-slate-500 text-center">
                      <svg className="h-12 w-12 text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <p className="text-sm font-bold text-slate-700">No documents found</p>
                      <p className="text-xs text-slate-400 mt-1 max-w-[220px] mx-auto font-medium">Add document details or check a different filter category tab.</p>
                    </div>
                  ) : (
                    <div className="flex-1 space-y-4 overflow-y-auto max-h-[520px] pr-1 pt-2 w-full">
                      {filteredDocuments.map((document) => {
                        const hasAttachment = Boolean(document.fileUrl);

                        return (
                          <div 
                            key={document.id} 
                            className="rounded-2xl border border-slate-200 bg-white p-4.5 sm:p-5 shadow-xs flex flex-col gap-3 relative group hover:shadow-md transition-all duration-300 w-full"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 overflow-hidden">
                                <div className="flex items-center">
                                  <CategoryIcon id={document.category} className="h-4.5 w-4.5 text-slate-500 shrink-0 mr-2" />
                                  <h3 className="text-sm font-bold text-slate-900 truncate" title={document.title}>{document.title}</h3>
                                  
                                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ml-auto shrink-0 ${
                                    hasAttachment 
                                      ? "bg-emerald-50 text-emerald-700 border border-emerald-100/50" 
                                      : "bg-amber-50 text-amber-700 border border-amber-100/50"
                                  }`}>
                                    {hasAttachment ? (
                                      <>
                                        <svg className="h-2.5 w-2.5 text-emerald-600 mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                        Secured
                                      </>
                                    ) : (
                                      <>
                                        <svg className="h-2.5 w-2.5 text-amber-600 mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                        Pending
                                      </>
                                    )}
                                  </span>
                                </div>
                                
                                {/* Progress bar inside specific card when uploading */}
                                {uploadingDocumentId === document.id ? (
                                  <div className="mt-2.5 w-full">
                                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 shadow-inner">
                                      <div className="h-full rounded-full bg-sky-600 transition-all duration-300 animate-pulse" style={{ width: `${uploadProgress}%` }} />
                                    </div>
                                    <p className="mt-1 text-[9px] font-bold text-slate-400 uppercase tracking-wider">Uploading file ({uploadProgress}%)...</p>
                                  </div>
                                ) : null}

                                {document.fileName ? (
                                  <p className="mt-2 text-[10px] font-semibold text-sky-700 truncate max-w-[280px] flex items-center gap-1.5">
                                    <svg className="h-3.5 w-3.5 text-sky-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                    </svg>
                                    <span>Attached: {document.fileName}</span>
                                  </p>
                                ) : null}

                                <div className="mt-3.5 flex flex-wrap items-center gap-2">
                                  <label className="cursor-pointer rounded-xl border border-slate-200 hover:border-slate-300 px-3 py-1.5 text-center text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 transition shadow-xs">
                                    {uploadingDocumentId === document.id ? "Uploading..." : "Upload File"}
                                    <input 
                                      type="file" 
                                      accept="image/*,.pdf" 
                                      className="hidden" 
                                      disabled={uploadingDocumentId === document.id}
                                      onChange={(event) => handleFileUpload(event, document.id)} 
                                    />
                                  </label>

                                  {document.fileUrl ? (
                                    <button
                                      type="button"
                                      onClick={() => togglePreview(document.id)}
                                      className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5 ${
                                        expandedPreviews[document.id]
                                          ? "border border-sky-600 bg-sky-600 text-white hover:bg-sky-700"
                                          : "border border-sky-200 bg-sky-50/70 hover:bg-sky-100/70 text-sky-700"
                                      }`}
                                    >
                                      {expandedPreviews[document.id] ? (
                                        <>
                                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                          </svg>
                                          Hide Preview
                                        </>
                                      ) : (
                                        <>
                                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                          </svg>
                                          Show Preview
                                        </>
                                      )}
                                    </button>
                                  ) : null}

                                  <button
                                    type="button"
                                    onClick={() => handleDeleteDocument(document.id)}
                                    className="rounded-xl border border-rose-200 bg-rose-50/75 hover:bg-rose-100/75 px-3.5 py-1.5 text-xs font-bold text-rose-700 transition shadow-xs cursor-pointer ml-auto"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Accordion Preview Box */}
                            {hasAttachment && (
                              <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
                                expandedPreviews[document.id] 
                                  ? "max-h-[350px] opacity-100 mt-4 border-t border-slate-100 pt-4" 
                                  : "max-h-0 opacity-0 pointer-events-none"
                              }`}>
                                {/* Image Preview Block */}
                                {document.fileType?.startsWith("image/") ? (
                                  /* eslint-disable-next-line @next/next/no-img-element */
                                  <a href={document.fileUrl} target="_blank" rel="noreferrer" className="block relative overflow-hidden rounded-xl border border-slate-100 shadow-inner group">
                                    <img src={document.fileUrl} alt={document.title} className="h-40 w-full object-cover group-hover:scale-102 transition-transform duration-300" />
                                  </a>
                                ) : null}

                                {/* PDF Preview block */}
                                {document.fileType === "application/pdf" ? (
                                  <div className="rounded-xl border border-sky-100/60 bg-sky-50/30 p-3.5 flex items-center justify-between text-xs">
                                    <span className="font-semibold text-slate-600 flex items-center gap-2">
                                      <svg className="h-4 w-4 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                      </svg>
                                      PDF Document
                                    </span>
                                    <a 
                                      href={document.fileUrl} 
                                      target="_blank" 
                                      rel="noreferrer" 
                                      className="font-bold text-sky-700 hover:text-sky-800 transition flex items-center gap-1"
                                    >
                                      Open PDF ↗
                                    </a>
                                  </div>
                                ) : null}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </section>

            </div>
          </div>
        </div>
      </main>

    </div>
  );
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

const STORAGE_KEY = "tripez-documents";
const STORAGE_BUCKET = "user-files";
const MAX_FILE_SIZE_BYTES = 1024 * 1024;

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

const starterDocuments = [];

const generateUniqueId = () => Date.now().toString();

const generateStoragePath = (userId, safeFileName) => {
  return `${userId}/${Date.now()}-${safeFileName}`;
};

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
  const [form, setForm] = useState({
    title: "",
    file: null,
  });
  const [uploadMessage, setUploadMessage] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadingDocumentId, setUploadingDocumentId] = useState(null);
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(true);

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
      setUserId(currentUserId);

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
      fileName: "",
      fileUrl: "",
      fileType: "",
    };

    setDocuments((currentDocuments) => [newDocument, ...currentDocuments]);

    setForm({ title: "", file: null });

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
    if (!confirmed) {
      return;
    }

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

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,_#f8fbff_0%,_#eef6ff_50%,_#ffffff_100%)] px-6 py-16 text-slate-900">
      <div className="mx-auto max-w-6xl rounded-[2rem] border border-slate-200 bg-white p-8 shadow-2xl shadow-slate-200/70">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-2xl shadow-sm">📄</div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-700">Document Vault</p>
                <h1 className="mt-1 text-3xl font-semibold sm:text-4xl">Keep your trip essentials organized</h1>
              </div>
            </div>
            <p className="mt-3 max-w-2xl text-lg text-slate-600">
              Save passport details, booking references, tickets, insurance, and other frequently used trip documents in one place.
            </p>
            <p className="mt-2 text-sm font-medium text-sky-700">Files are uploaded to Cloud Storage and linked to your account.</p>
          </div>

          <Link href="/dashboard" className="rounded-full border border-slate-300 px-5 py-3 font-semibold text-slate-700 transition hover:border-sky-300 hover:text-sky-700">
             Back to dashboard
          </Link>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <form onSubmit={handleAddDocument} className="space-y-4 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-6">
            <div>
              <h2 className="text-xl font-semibold text-slate-950">Add a document</h2>
              <p className="mt-1 text-sm text-slate-600">Use this to save anything you may need during your trip.</p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Document title</label>
              <input
                value={form.title}
                onChange={(event) => setForm((currentForm) => ({ ...currentForm, title: event.target.value }))}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3"
                placeholder="Ex : Passport"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Attach file </label>
              <label className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-slate-300 bg-white px-4 py-3 shadow-sm transition hover:border-sky-400 hover:bg-sky-50">
                <span className="text-sm font-medium text-slate-700">{form.file ? form.file.name : "Choose file"}</span>
                <span className="rounded-full bg-sky-600 px-3 py-1.5 text-sm font-semibold text-white">Browse</span>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(event) => setForm((currentForm) => ({ ...currentForm, file: event.target.files?.[0] || null }))}
                  className="sr-only"
                />
              </label>
             
              {form.file ? <p className="mt-2 text-sm font-medium text-sky-700">Selected file: {form.file.name}</p> : null}
            </div>

            {uploadMessage ? <p className="rounded-2xl bg-sky-50 px-4 py-3 text-sm text-sky-700">{uploadMessage}</p> : null}

            <button type="submit" className="w-full rounded-full bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-700">
              Save document
            </button>
          </form>

          <div className="space-y-4 rounded-[1.5rem] border border-slate-200 bg-white p-6">
            <div>
              <h2 className="text-xl font-semibold text-slate-950">Saved documents</h2>
              <p className="mt-1 text-sm text-slate-600">Keep a handy checklist for your next trip.</p>
            </div>

            {loading ? (
              <div className="rounded-[1.25rem] border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
                Loading your vault...
              </div>
            ) : documents.length === 0 ? (
              <div className="rounded-[1.25rem] border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
                No documents saved yet. Add your first one above.
              </div>
            ) : (
              <div className="space-y-3">
                {documents.map((document) => (
                  <div key={document.id} className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-slate-950">{document.title}</h3>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <label className="cursor-pointer rounded-full border border-slate-300 px-3 py-2 text-center text-sm font-semibold text-slate-700 transition hover:border-sky-300 hover:text-sky-700">
                            {uploadingDocumentId === document.id ? "Uploading..." : "Upload file"}
                            <input type="file" accept="image/*,.pdf" className="hidden" onChange={(event) => handleFileUpload(event, document.id)} />
                          </label>
                          {document.fileUrl ? (
                            <button
                              type="button"
                              onClick={() => handleViewDocument(document)}
                              className="rounded-full border border-sky-200 bg-sky-50 px-3 py-2 text-sm font-semibold text-sky-700"
                            >
                              View file
                            </button>
                          ) : null}
                          <button
                            type="button"
                            onClick={() => handleDeleteDocument(document.id)}
                            className="text-sm font-semibold text-rose-600"
                          >
                            Delete
                          </button>
                        </div>
                        {uploadingDocumentId === document.id ? (
                          <div className="mt-3 w-full">
                            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                              <div className="h-full rounded-full bg-sky-600 transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                            </div>
                            <p className="mt-2 text-sm text-slate-600">Uploading your file…</p>
                          </div>
                        ) : null}
                        {document.fileName ? (
                          <p className="mt-3 text-sm font-medium text-sky-700">Attached file: {document.fileName}</p>
                        ) : null}
                      </div>
                    </div>

                    {document.fileUrl && document.fileType?.startsWith("image/") ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={document.fileUrl} alt={document.title} className="mt-4 h-40 w-full rounded-2xl object-cover" />
                    ) : null}

                    {document.fileUrl && document.fileType === "application/pdf" ? (
                      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-3">
                        <a href={document.fileUrl} target="_blank" rel="noreferrer" className="text-sm font-semibold text-sky-700">
                          Open PDF
                        </a>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

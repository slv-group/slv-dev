import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Upload, CheckCircle2, FileText, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export type FieldConfig = {
  name: string;
  label: string;
  type?: "text" | "email" | "tel" | "date" | "number" | "select" | "textarea" | "file";
  required?: boolean;
  placeholder?: string;
  options?: string[];
  accept?: string;
  multiple?: boolean;
};

export type SectionConfig = {
  title: string;
  description?: string;
  fields: FieldConfig[];
};

type Props = {
  title: string;
  subtitle: string;
  registrationType:
    "architect_consultant" | "contractor" | "vendor_supplier" | "land_proposal" | "workshop";
  sections: SectionConfig[];
  submitLabel: string;
};

export function WorkRegistrationForm({
  title,
  subtitle,
  registrationType,
  sections,
  submitLabel,
}: Props) {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [files, setFiles] = useState<Record<string, File | File[] | null>>({});
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);

  const updateField = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const scrollToField = (fieldName: string) => {
    const element = document.getElementById(`field-${fieldName}`);

    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  };

  const validateForm = () => {
    /*
     * Validate every field manually.
     *
     * We intentionally don't depend entirely on HTML required validation
     * because file inputs are hidden and the browser cannot focus a hidden
     * required input.
     */
    for (const section of sections) {
      for (const field of section.fields) {
        if (!field.required) continue;

        if (field.type === "file") {
          const fieldFiles = files[field.name];
          if (!fieldFiles || (Array.isArray(fieldFiles) && fieldFiles.length === 0)) {
            toast.error(`${field.label} is required.`);
            scrollToField(field.name);
            return false;
          }

          continue;
        }

        const value = formData[field.name]?.trim();

        if (!value) {
          toast.error(`${field.label} is required.`);
          scrollToField(field.name);
          return false;
        }
      }
    }

    // Validate every selected file before uploading anything.
    for (const section of sections) {
      for (const field of section.fields) {
        if (field.type !== "file") continue;

        const fileData = files[field.name];

        if (fileData) {
          if (Array.isArray(fileData)) {
            for (const file of fileData) {
              if (file.size > MAX_FILE_SIZE) {
                toast.error(`${field.label} contains a file larger than 10 MB.`);
                scrollToField(field.name);
                return false;
              }
            }
          } else {
            if (fileData.size > MAX_FILE_SIZE) {
              toast.error(`${field.label} must be smaller than 10 MB.`);
              scrollToField(field.name);
              return false;
            }
          }
        }
      }
    }

    if (!agree) {
      toast.error("Please accept the terms and conditions before submitting.");

      document.getElementById("terms-section")?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

      return false;
    }

    return true;
  };

  const handleFileChange = (
    field: FieldConfig,
    fileList: FileList | null,
    input: HTMLInputElement,
  ) => {
    if (!fileList || fileList.length === 0) {
      setFiles((prev) => ({
        ...prev,
        [field.name]: field.multiple ? [] : null,
      }));

      return;
    }

    if (field.multiple) {
      const newFiles = Array.from(fileList);
      for (const file of newFiles) {
        if (file.size > MAX_FILE_SIZE) {
          toast.error(`${file.name} exceeds the 10 MB maximum file size.`);
          input.value = "";
          return;
        }
      }
      setFiles((prev) => ({
        ...prev,
        [field.name]: [
          ...(Array.isArray(prev[field.name]) ? (prev[field.name] as File[]) : []),
          ...newFiles,
        ],
      }));
    } else {
      const file = fileList[0];
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${field.label} exceeds the 10 MB maximum file size.`);
        input.value = "";
        setFiles((prev) => ({
          ...prev,
          [field.name]: null,
        }));
        return;
      }
      setFiles((prev) => ({
        ...prev,
        [field.name]: file,
      }));
    }
  };

  const removeFile = (fieldName: string, indexToRemove?: number) => {
    setFiles((prev) => {
      const current = prev[fieldName];
      if (Array.isArray(current) && indexToRemove !== undefined) {
        return {
          ...prev,
          [fieldName]: current.filter((_, i) => i !== indexToRemove),
        };
      }
      return {
        ...prev,
        [fieldName]: null,
      };
    });

    const input = document.getElementById(`file-${fieldName}`) as HTMLInputElement | null;

    if (input && indexToRemove === undefined) {
      input.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (loading) return;

    // Validate everything before uploading files.
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const documentPaths: Record<string, string | string[]> = {};

      /*
       * Upload documents only after all validation has passed.
       */
      for (const [fieldName, fileData] of Object.entries(files)) {
        if (!fileData) continue;

        if (Array.isArray(fileData)) {
          if (fileData.length === 0) continue;
          const paths: string[] = [];
          for (const file of fileData) {
            if (file.size > MAX_FILE_SIZE) {
              throw new Error(`${file.name} exceeds the 10 MB upload limit.`);
            }

            const extension = file.name.split(".").pop()?.toLowerCase() || "file";
            const uniqueName = `${crypto.randomUUID()}.${extension}`;
            const path = `${registrationType}/${uniqueName}`;

            const { error: uploadError } = await supabase.storage
              .from("registration-documents")
              .upload(path, file, {
                cacheControl: "3600",
                upsert: false,
              });

            if (uploadError) {
              console.error(`[WorkRegistration] Failed uploading ${fieldName}:`, uploadError);
              throw new Error(`Failed to upload "${file.name}": ${uploadError.message}`);
            }
            paths.push(path);
          }
          documentPaths[fieldName] = paths;
        } else {
          const file = fileData;
          if (file.size > MAX_FILE_SIZE) {
            throw new Error(`${file.name} exceeds the 10 MB upload limit.`);
          }

          const extension = file.name.split(".").pop()?.toLowerCase() || "file";
          const uniqueName = `${crypto.randomUUID()}.${extension}`;
          const path = `${registrationType}/${uniqueName}`;

          const { error: uploadError } = await supabase.storage
            .from("registration-documents")
            .upload(path, file, {
              cacheControl: "3600",
              upsert: false,
            });

          if (uploadError) {
            console.error(`[WorkRegistration] Failed uploading ${fieldName}:`, uploadError);
            throw new Error(`Failed to upload "${file.name}": ${uploadError.message}`);
          }

          documentPaths[fieldName] = path;
        }
      }

      /*
       * Save registration details.
       */
      const { error: insertError } = await supabase.from("work_registrations").insert({
        registration_type: registrationType,

        applicant_name:
          formData.full_name || formData.company_name || formData.company_firm_name || "",

        email: formData.email || "",

        phone: formData.mobile_number || "",

        form_data: formData,

        document_paths: documentPaths,
        viewed: false,
      });

      if (insertError) {
        console.error("[WorkRegistration] Database insert error:", insertError);

        throw new Error(insertError.message);
      }

      toast.success("Your application has been submitted successfully.", {
        duration: 5000,
      });

      // Reset form after successful submission.
      setFormData({});
      setFiles({});
      setAgree(false);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (error) {
      console.error("[WorkRegistration] Submission error:", error);

      if (error instanceof Error) {
        const message = error.message.toLowerCase();

        if (message.includes("maximum allowed size") || message.includes("exceeds the 10 mb")) {
          toast.error("One of your files exceeds the 10 MB upload limit.");
        } else if (message.includes("row-level security")) {
          toast.error("You do not have permission to submit this application.");
        } else if (message.includes("failed to upload")) {
          toast.error(error.message);
        } else {
          toast.error(`Unable to submit application: ${error.message}`);
        }
      } else {
        toast.error("Unable to submit application. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background pb-20 pt-32">
      <div className="mx-auto max-w-5xl px-6">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <p className="section-label text-gold">Work With Us</p>

          <h1 className="mt-4 font-display text-4xl font-bold text-foreground sm:text-5xl">
            {title}
          </h1>

          <p className="mt-4 text-muted-foreground">{subtitle}</p>

          <div
            className="mx-auto mt-6 h-px w-28"
            style={{
              background: "linear-gradient(90deg, transparent, var(--color-gold), transparent)",
            }}
          />

          <p className="mt-5 text-xs text-muted-foreground">
            Fields marked with <span className="font-semibold text-red-500">*</span> are required.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="mt-12 space-y-8">
          {sections.map((section) => (
            <section
              key={section.title}
              className="rounded-3xl border border-border/60 bg-card p-6 shadow-sm sm:p-8"
            >
              <div className="mb-7">
                <h2 className="font-display text-xl font-semibold text-foreground">
                  {section.title}
                </h2>
                {section.description && (
                  <p className="mt-2 text-sm text-muted-foreground">{section.description}</p>
                )}

                <div className="mt-3 h-px w-full bg-border/60" />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {section.fields.map((field) => {
                  /*
                   * Textarea
                   */
                  if (field.type === "textarea") {
                    return (
                      <div
                        key={field.name}
                        id={`field-${field.name}`}
                        className="space-y-2 md:col-span-2"
                      >
                        <Label htmlFor={field.name}>
                          {field.label}

                          {field.required && <span className="ml-1 text-red-500">*</span>}
                        </Label>

                        <Textarea
                          id={field.name}
                          name={field.name}
                          value={formData[field.name] || ""}
                          placeholder={field.placeholder}
                          onChange={(e) => updateField(field.name, e.target.value)}
                          className="min-h-32"
                        />
                      </div>
                    );
                  }

                  /*
                   * Select
                   */
                  if (field.type === "select") {
                    return (
                      <div key={field.name} id={`field-${field.name}`} className="space-y-2">
                        <Label htmlFor={field.name}>
                          {field.label}

                          {field.required && <span className="ml-1 text-red-500">*</span>}
                        </Label>

                        <select
                          id={field.name}
                          name={field.name}
                          value={formData[field.name] || ""}
                          onChange={(e) => updateField(field.name, e.target.value)}
                          className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition focus:border-gold focus:ring-1 focus:ring-gold/30"
                        >
                          <option value="">Select an option</option>

                          {field.options?.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>
                    );
                  }

                  /*
                   * File upload
                   */
                  if (field.type === "file") {
                    const selectedFiles = files[field.name];
                    const isMultiple = field.multiple;
                    const hasFiles = isMultiple
                      ? Array.isArray(selectedFiles) && selectedFiles.length > 0
                      : !!selectedFiles;

                    return (
                      <div
                        key={field.name}
                        id={`field-${field.name}`}
                        className={`space-y-2 ${isMultiple ? "md:col-span-2" : ""}`}
                      >
                        <Label>
                          {field.label}

                          {field.required && <span className="ml-1 text-red-500">*</span>}
                        </Label>

                        <div className="space-y-3">
                          {(!hasFiles || isMultiple) && (
                            <label
                              htmlFor={`file-${field.name}`}
                              className="group flex min-h-28 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-gold/40 bg-gold/[0.03] px-4 py-6 text-center transition-all hover:border-gold hover:bg-gold/[0.06]"
                            >
                              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gold/10 transition group-hover:bg-gold/15">
                                <Upload className="h-4 w-4 text-gold" />
                              </div>

                              <span className="text-sm font-medium text-foreground">
                                {isMultiple && hasFiles ? "Add more files" : "Choose file"}
                              </span>

                              <span className="text-xs text-muted-foreground">
                                PDF, JPG or PNG • Maximum 10 MB {isMultiple && "per file"}
                              </span>

                              <input
                                id={`file-${field.name}`}
                                name={field.name}
                                type="file"
                                hidden
                                accept={field.accept}
                                multiple={isMultiple}
                                onChange={(e) => handleFileChange(field, e.target.files, e.target)}
                              />
                            </label>
                          )}

                          {hasFiles && (
                            <div className="space-y-2">
                              {isMultiple && Array.isArray(selectedFiles)
                                ? selectedFiles.map((file, idx) => (
                                    <div
                                      key={idx}
                                      className="flex min-h-24 items-center justify-between gap-3 rounded-xl border border-gold/30 bg-gold/[0.04] p-4"
                                    >
                                      <div className="flex min-w-0 items-center gap-3">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gold/10">
                                          <FileText className="h-5 w-5 text-gold" />
                                        </div>

                                        <div className="min-w-0">
                                          <p className="truncate text-sm font-medium text-foreground">
                                            {file.name}
                                          </p>

                                          <p className="mt-0.5 text-xs text-muted-foreground">
                                            {(file.size / (1024 * 1024)).toFixed(2)} MB
                                          </p>
                                        </div>
                                      </div>

                                      <button
                                        type="button"
                                        onClick={() => removeFile(field.name, idx)}
                                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
                                        aria-label={`Remove ${file.name}`}
                                      >
                                        <X className="h-4 w-4" />
                                      </button>
                                    </div>
                                  ))
                                : !Array.isArray(selectedFiles) &&
                                  selectedFiles && (
                                    <div className="flex min-h-24 items-center justify-between gap-3 rounded-xl border border-gold/30 bg-gold/[0.04] p-4">
                                      <div className="flex min-w-0 items-center gap-3">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gold/10">
                                          <FileText className="h-5 w-5 text-gold" />
                                        </div>

                                        <div className="min-w-0">
                                          <p className="truncate text-sm font-medium text-foreground">
                                            {selectedFiles.name}
                                          </p>

                                          <p className="mt-0.5 text-xs text-muted-foreground">
                                            {(selectedFiles.size / (1024 * 1024)).toFixed(2)} MB
                                          </p>
                                        </div>
                                      </div>

                                      <button
                                        type="button"
                                        onClick={() => removeFile(field.name)}
                                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
                                        aria-label={`Remove ${selectedFiles.name}`}
                                      >
                                        <X className="h-4 w-4" />
                                      </button>
                                    </div>
                                  )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }

                  /*
                   * Normal input
                   */
                  return (
                    <div key={field.name} id={`field-${field.name}`} className="space-y-2">
                      <Label htmlFor={field.name}>
                        {field.label}

                        {field.required && <span className="ml-1 text-red-500">*</span>}
                      </Label>

                      <Input
                        id={field.name}
                        name={field.name}
                        type={field.type || "text"}
                        value={formData[field.name] || ""}
                        placeholder={field.placeholder}
                        onChange={(e) => updateField(field.name, e.target.value)}
                      />
                    </div>
                  );
                })}
              </div>
            </section>
          ))}

          {/* Terms */}
          <div id="terms-section" className="rounded-2xl border border-border bg-card p-6">
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                className="mt-1 h-4 w-4 accent-gold"
              />

              <span className="text-sm leading-relaxed text-muted-foreground">
                I confirm that the information provided above is accurate and agree to SLV
                Group&apos; terms and conditions.
                <span className="ml-1 text-red-500">*</span>
              </span>
            </label>
          </div>

          {/* Submit */}
          <div className="flex justify-center">
            <Button
              type="submit"
              disabled={loading}
              className="min-w-60 bg-gradient-gold px-8 py-6 font-semibold text-obsidian"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  {submitLabel}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
}

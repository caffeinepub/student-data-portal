import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowUp,
  BookOpen,
  GraduationCap,
  Loader2,
  Pencil,
  Trash2,
  Users,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  useAddStudent,
  useDeleteStudent,
  useGetStudents,
  useUpdateStudent,
} from "./hooks/useQueries";
import type { Student } from "./hooks/useQueries";

interface FormState {
  rollNo: string;
  name: string;
  grNo: string;
  penNo: string;
  apaarNo: string;
  udiseCode: string;
  aadharNo: string;
  col1: string;
  col2: string;
  col3: string;
}

const initialForm: FormState = {
  rollNo: "",
  name: "",
  grNo: "",
  penNo: "",
  apaarNo: "",
  udiseCode: "",
  aadharNo: "",
  col1: "",
  col2: "",
  col3: "",
};

const LS_KEY_COL1 = "sdp_col1_heading";
const LS_KEY_COL2 = "sdp_col2_heading";
const LS_KEY_COL3 = "sdp_col3_heading";

function getStoredHeading(key: string, fallback: string): string {
  try {
    return localStorage.getItem(key) || fallback;
  } catch {
    return fallback;
  }
}

// Inline-editable column heading component
function EditableHeading({
  value,
  defaultLabel,
  onSave,
  ocidPrefix,
}: {
  value: string;
  defaultLabel: string;
  onSave: (newVal: string) => void;
  ocidPrefix: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value || defaultLabel);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDraft(value || defaultLabel);
  }, [value, defaultLabel]);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  function startEdit() {
    setDraft(value || defaultLabel);
    setEditing(true);
  }

  function commitEdit() {
    const trimmed = draft.trim() || defaultLabel;
    setEditing(false);
    onSave(trimmed);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") commitEdit();
    if (e.key === "Escape") {
      setDraft(value || defaultLabel);
      setEditing(false);
    }
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commitEdit}
        onKeyDown={handleKeyDown}
        className="bg-transparent border-b border-white/60 text-table-header-foreground text-xs font-semibold uppercase tracking-wide outline-none w-28 min-w-0"
        data-ocid={`${ocidPrefix}.input`}
      />
    );
  }

  return (
    <span className="flex items-center gap-1 group cursor-default">
      <span>{value || defaultLabel}</span>
      <button
        type="button"
        onClick={startEdit}
        className="opacity-0 group-hover:opacity-100 transition-opacity ml-1 text-table-header-foreground/60 hover:text-table-header-foreground"
        title="હેડિંગ બદલો"
        data-ocid={`${ocidPrefix}.edit_button`}
      >
        <Pencil className="w-3 h-3" />
      </button>
    </span>
  );
}

export default function App() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<Partial<FormState>>({});

  // Column headings stored in localStorage - no backend required
  const [col1Heading, setCol1Heading] = useState(() =>
    getStoredHeading(LS_KEY_COL1, "કૉલમ 1"),
  );
  const [col2Heading, setCol2Heading] = useState(() =>
    getStoredHeading(LS_KEY_COL2, "કૉલમ 2"),
  );
  const [col3Heading, setCol3Heading] = useState(() =>
    getStoredHeading(LS_KEY_COL3, "કૉલમ 3"),
  );

  // Edit dialog state
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [editForm, setEditForm] = useState<FormState>(initialForm);
  const [editErrors, setEditErrors] = useState<Partial<FormState>>({});

  const { data: students = [], isLoading: studentsLoading } = useGetStudents();
  const addMutation = useAddStudent();
  const deleteMutation = useDeleteStudent();
  const updateMutation = useUpdateStudent();

  function handleChange(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }

  function validate(): boolean {
    const newErrors: Partial<FormState> = {};
    if (!form.rollNo.trim()) newErrors.rollNo = "Roll No. જરૂરી છે";
    if (!form.name.trim()) newErrors.name = "વિદ્યાર્થીનું નામ જરૂરી છે";
    if (!form.grNo.trim()) newErrors.grNo = "G.R. No. જરૂરી છે";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) {
      toast.error("કૃપા કરીને નામ અને રોલ નંબર લખો.");
      return;
    }

    try {
      await addMutation.mutateAsync({
        rollNo: BigInt(form.rollNo),
        name: form.name.trim(),
        grNo: form.grNo.trim(),
        penNo: form.penNo.trim(),
        apaarNo: form.apaarNo.trim(),
        udiseCode: form.udiseCode.trim(),
        aadharNo: form.aadharNo.trim(),
        col1: form.col1.trim(),
        col2: form.col2.trim(),
        col3: form.col3.trim(),
      });
      setForm(initialForm);
      setErrors({});
      toast.success("વિદ્યાર્થીની માહિતી સફળતાપૂર્વક સેવ થઈ!");
    } catch {
      toast.error("માહિતી સેવ કરવામાં ભૂલ. ફરી પ્રયાસ કરો.");
    }
  }

  async function handleDelete(id: bigint) {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("વિદ્યાર્થી સફળતાપૂર્વક કાઢી નાખ્યો.");
    } catch {
      toast.error("કાઢી નાખવામાં ભૂલ. ફરી પ્રયાસ કરો.");
    }
  }

  function openEditDialog(student: Student) {
    setEditingStudent(student);
    setEditForm({
      rollNo: student.rollNo.toString(),
      name: student.name,
      grNo: student.grNo,
      penNo: student.penNo,
      apaarNo: student.apaarNo,
      udiseCode: student.udiseCode,
      aadharNo: student.aadharNo,
      col1: student.col1,
      col2: student.col2,
      col3: student.col3,
    });
    setEditErrors({});
  }

  function closeEditDialog() {
    setEditingStudent(null);
    setEditForm(initialForm);
    setEditErrors({});
  }

  function handleEditChange(field: keyof FormState, value: string) {
    setEditForm((prev) => ({ ...prev, [field]: value }));
    if (editErrors[field]) {
      setEditErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }

  function validateEdit(): boolean {
    const newErrors: Partial<FormState> = {};
    if (!editForm.rollNo.trim()) newErrors.rollNo = "Roll No. જરૂરી છે";
    if (!editForm.name.trim()) newErrors.name = "વિદ્યાર્થીનું નામ જરૂરી છે";
    if (!editForm.grNo.trim()) newErrors.grNo = "G.R. No. જરૂરી છે";
    setEditErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleEditSave() {
    if (!editingStudent) return;
    if (!validateEdit()) {
      toast.error("કૃપા કરીને નામ અને રોલ નંબર લખો.");
      return;
    }
    try {
      await updateMutation.mutateAsync({
        id: editingStudent.id,
        rollNo: BigInt(editForm.rollNo),
        name: editForm.name.trim(),
        grNo: editForm.grNo.trim(),
        penNo: editForm.penNo.trim(),
        apaarNo: editForm.apaarNo.trim(),
        udiseCode: editForm.udiseCode.trim(),
        aadharNo: editForm.aadharNo.trim(),
        col1: editForm.col1.trim(),
        col2: editForm.col2.trim(),
        col3: editForm.col3.trim(),
      });
      closeEditDialog();
      toast.success("વિદ્યાર્થીની માહિતી સફળતાપૂર્વક અપડેટ થઈ!");
    } catch {
      toast.error("અપડેટ કરવામાં ભૂલ. ફરી પ્રયાસ કરો.");
    }
  }

  function saveHeading(key: string, value: string) {
    try {
      localStorage.setItem(key, value);
    } catch {
      // ignore storage errors
    }
  }

  function handleSaveCol1(v: string) {
    setCol1Heading(v);
    saveHeading(LS_KEY_COL1, v);
    toast.success("કૉલમ 1 હેડિંગ સેવ થઈ!");
  }

  function handleSaveCol2(v: string) {
    setCol2Heading(v);
    saveHeading(LS_KEY_COL2, v);
    toast.success("કૉલમ 2 હેડિંગ સેવ થઈ!");
  }

  function handleSaveCol3(v: string) {
    setCol3Heading(v);
    saveHeading(LS_KEY_COL3, v);
    toast.success("કૉલમ 3 હેડિંગ સેવ થઈ!");
  }

  const isSaving = addMutation.isPending;
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Toaster richColors position="top-right" />

      {/* Header */}
      <header className="portal-header grain-overlay relative overflow-hidden">
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-start gap-4"
          >
            <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-sm">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-white leading-tight tracking-tight">
                વિદ્યાર્થી માહિતી પોર્ટલ
              </h1>
              <p className="text-white/70 text-sm mt-1 font-body">
                Student Data Management Portal
              </p>
            </div>
          </motion.div>

          {/* Stats strip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mt-6 flex gap-6"
          >
            <div className="flex items-center gap-2 bg-white/10 rounded-lg px-4 py-2 border border-white/15 backdrop-blur-sm">
              <Users className="w-4 h-4 text-white/80" />
              <span className="text-white/90 text-sm font-medium font-body">
                {studentsLoading ? "..." : `${students.length} વિદ્યાર્થીઓ`}
              </span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 rounded-lg px-4 py-2 border border-white/15 backdrop-blur-sm">
              <BookOpen className="w-4 h-4 text-white/80" />
              <span className="text-white/90 text-sm font-medium font-body">
                શૈક્ષણિક વ્યવસ્થાપન
              </span>
            </div>
          </motion.div>
        </div>

        {/* Decorative circles */}
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/5 border border-white/10 pointer-events-none" />
        <div className="absolute top-4 right-24 w-20 h-20 rounded-full bg-white/5 border border-white/10 pointer-events-none" />
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-10">
        {/* Form Card */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.45 }}
          className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden mb-8"
        >
          <div className="px-6 py-4 border-b border-border bg-secondary/40">
            <h2 className="font-display text-lg font-semibold text-card-foreground">
              નવો વિદ્યાર્થી ઉમેરો
            </h2>
            <p className="text-muted-foreground text-sm mt-0.5">
              Add New Student — નીચેના ફોર્મમાં માહિતી ભરો
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="p-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {/* Roll No */}
              <div className="col-span-1 space-y-1.5">
                <Label htmlFor="rollNo" className="font-medium text-sm">
                  Roll No. <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="rollNo"
                  type="number"
                  placeholder="જેમ કે 1"
                  value={form.rollNo}
                  onChange={(e) => handleChange("rollNo", e.target.value)}
                  className={
                    errors.rollNo
                      ? "border-destructive ring-destructive/30 focus-visible:ring-destructive/40"
                      : ""
                  }
                  data-ocid="student.rollno.input"
                  min={1}
                />
                <AnimatePresence>
                  {errors.rollNo && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-destructive text-xs"
                      data-ocid="student.rollno.error_state"
                    >
                      {errors.rollNo}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Student Name */}
              <div className="col-span-2 sm:col-span-2 lg:col-span-2 space-y-1.5">
                <Label htmlFor="name" className="font-medium text-sm">
                  વિદ્યાર્થીનું નામ <span className="text-destructive">*</span>
                  <span className="text-muted-foreground font-normal ml-1.5">
                    (Student Name)
                  </span>
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="પૂરું નામ લખો"
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className={
                    errors.name
                      ? "border-destructive ring-destructive/30 focus-visible:ring-destructive/40"
                      : ""
                  }
                  data-ocid="student.name.input"
                />
                <AnimatePresence>
                  {errors.name && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-destructive text-xs"
                      data-ocid="student.name.error_state"
                    >
                      {errors.name}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* G.R. No */}
              <div className="col-span-1 space-y-1.5">
                <Label htmlFor="grNo" className="font-medium text-sm">
                  G.R. No. <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="grNo"
                  type="text"
                  placeholder="GR નંબર"
                  value={form.grNo}
                  onChange={(e) => handleChange("grNo", e.target.value)}
                  className={
                    errors.grNo
                      ? "border-destructive ring-destructive/30 focus-visible:ring-destructive/40"
                      : ""
                  }
                  data-ocid="student.grno.input"
                />
                <AnimatePresence>
                  {errors.grNo && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-destructive text-xs"
                      data-ocid="student.grno.error_state"
                    >
                      {errors.grNo}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* PEN No */}
              <div className="col-span-1 space-y-1.5">
                <Label htmlFor="penNo" className="font-medium text-sm">
                  PEN No.
                </Label>
                <Input
                  id="penNo"
                  type="text"
                  placeholder="PEN નંબર"
                  value={form.penNo}
                  onChange={(e) => handleChange("penNo", e.target.value)}
                  data-ocid="student.penno.input"
                />
              </div>

              {/* APAAR No */}
              <div className="col-span-1 space-y-1.5">
                <Label htmlFor="apaarNo" className="font-medium text-sm">
                  APAAR No.
                </Label>
                <Input
                  id="apaarNo"
                  type="text"
                  placeholder="APAAR નંબર"
                  value={form.apaarNo}
                  onChange={(e) => handleChange("apaarNo", e.target.value)}
                  data-ocid="student.apaarno.input"
                />
              </div>

              {/* UDISE Code */}
              <div className="col-span-1 space-y-1.5">
                <Label htmlFor="udiseCode" className="font-medium text-sm">
                  UDISE Code
                </Label>
                <Input
                  id="udiseCode"
                  type="text"
                  placeholder="UDISE કોડ"
                  value={form.udiseCode}
                  onChange={(e) => handleChange("udiseCode", e.target.value)}
                  data-ocid="student.udise.input"
                />
              </div>

              {/* Aadhar No */}
              <div className="col-span-1 space-y-1.5">
                <Label htmlFor="aadharNo" className="font-medium text-sm">
                  Aadhar No.
                </Label>
                <Input
                  id="aadharNo"
                  type="text"
                  placeholder="આધાર નંબર"
                  value={form.aadharNo}
                  onChange={(e) => handleChange("aadharNo", e.target.value)}
                  data-ocid="student.aadhar.input"
                  maxLength={12}
                />
              </div>

              {/* Custom Col 1 */}
              <div className="col-span-1 space-y-1.5">
                <Label htmlFor="col1" className="font-medium text-sm">
                  {col1Heading}
                </Label>
                <Input
                  id="col1"
                  type="text"
                  placeholder={col1Heading}
                  value={form.col1}
                  onChange={(e) => handleChange("col1", e.target.value)}
                  data-ocid="student.col1.input"
                />
              </div>

              {/* Custom Col 2 */}
              <div className="col-span-1 space-y-1.5">
                <Label htmlFor="col2" className="font-medium text-sm">
                  {col2Heading}
                </Label>
                <Input
                  id="col2"
                  type="text"
                  placeholder={col2Heading}
                  value={form.col2}
                  onChange={(e) => handleChange("col2", e.target.value)}
                  data-ocid="student.col2.input"
                />
              </div>

              {/* Custom Col 3 */}
              <div className="col-span-1 space-y-1.5">
                <Label htmlFor="col3" className="font-medium text-sm">
                  {col3Heading}
                </Label>
                <Input
                  id="col3"
                  type="text"
                  placeholder={col3Heading}
                  value={form.col3}
                  onChange={(e) => handleChange("col3", e.target.value)}
                  data-ocid="student.col3.input"
                />
              </div>
            </div>

            {/* Submit */}
            <div className="mt-6 flex items-center justify-between gap-4">
              <p className="text-xs text-muted-foreground">
                <span className="text-destructive">*</span> ફરજિયાત ક્ષેત્ર
              </p>
              <Button
                type="submit"
                disabled={isSaving}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-2.5 rounded-xl shadow-sm transition-all duration-200 hover:shadow-md"
                data-ocid="student.submit_button"
              >
                {isSaving ? (
                  <>
                    <Loader2
                      className="mr-2 h-4 w-4 animate-spin"
                      data-ocid="student.loading_state"
                    />
                    સેવ થઈ રહ્યું છે...
                  </>
                ) : (
                  "માહિતી સેવ કરો"
                )}
              </Button>
            </div>
          </form>
        </motion.section>

        {/* Students Table */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.45 }}
          className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-border bg-secondary/40 flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-semibold text-card-foreground">
                વિદ્યાર્થીઓની યાદી
              </h2>
              <p className="text-muted-foreground text-sm mt-0.5">
                All Students —{" "}
                {studentsLoading ? "..." : `${students.length} નોંધ`}
              </p>
            </div>
          </div>

          {studentsLoading ? (
            <div className="p-6 space-y-3" data-ocid="student.loading_state">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table data-ocid="student.table">
                <TableHeader>
                  <TableRow className="bg-table-header hover:bg-table-header border-table-header">
                    <TableHead className="text-table-header-foreground font-semibold font-display text-xs uppercase tracking-wide">
                      <span className="flex items-center gap-1">
                        Roll No
                        <ArrowUp
                          className="w-3 h-3 text-table-header-foreground/70"
                          aria-label="Ascending sort"
                        />
                      </span>
                    </TableHead>
                    <TableHead className="text-table-header-foreground font-semibold font-display text-xs uppercase tracking-wide min-w-36">
                      Name / નામ
                    </TableHead>
                    <TableHead className="text-table-header-foreground font-semibold font-display text-xs uppercase tracking-wide">
                      G.R. No
                    </TableHead>
                    <TableHead className="text-table-header-foreground font-semibold font-display text-xs uppercase tracking-wide">
                      PEN No
                    </TableHead>
                    <TableHead className="text-table-header-foreground font-semibold font-display text-xs uppercase tracking-wide">
                      APAAR No
                    </TableHead>
                    <TableHead className="text-table-header-foreground font-semibold font-display text-xs uppercase tracking-wide">
                      UDISE
                    </TableHead>
                    <TableHead className="text-table-header-foreground font-semibold font-display text-xs uppercase tracking-wide">
                      Aadhar No
                    </TableHead>
                    {/* Custom editable column headings */}
                    <TableHead className="text-table-header-foreground font-semibold font-display text-xs uppercase tracking-wide min-w-28">
                      <EditableHeading
                        value={col1Heading}
                        defaultLabel="કૉલમ 1"
                        onSave={handleSaveCol1}
                        ocidPrefix="col1.heading"
                      />
                    </TableHead>
                    <TableHead className="text-table-header-foreground font-semibold font-display text-xs uppercase tracking-wide min-w-28">
                      <EditableHeading
                        value={col2Heading}
                        defaultLabel="કૉલમ 2"
                        onSave={handleSaveCol2}
                        ocidPrefix="col2.heading"
                      />
                    </TableHead>
                    <TableHead className="text-table-header-foreground font-semibold font-display text-xs uppercase tracking-wide min-w-28">
                      <EditableHeading
                        value={col3Heading}
                        defaultLabel="કૉલમ 3"
                        onSave={handleSaveCol3}
                        ocidPrefix="col3.heading"
                      />
                    </TableHead>
                    <TableHead className="text-table-header-foreground font-semibold font-display text-xs uppercase tracking-wide text-right">
                      ક્રિયા
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {students.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={11}
                          className="py-16 text-center"
                          data-ocid="student.empty_state"
                        >
                          <div className="flex flex-col items-center gap-3">
                            <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
                              <GraduationCap className="w-7 h-7 text-muted-foreground" />
                            </div>
                            <p className="text-muted-foreground font-medium">
                              કોઈ વિદ્યાર્થી નોંધાયા નથી.
                            </p>
                            <p className="text-muted-foreground text-sm">
                              ઉપરના ફોર્મ દ્વારા વિદ્યાર્થી ઉમેરો
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      students.map((student, index) => (
                        <motion.tr
                          key={student.id.toString()}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          transition={{ delay: index * 0.04 }}
                          className="border-b border-border last:border-0 hover:bg-accent/30 transition-colors"
                          data-ocid={`student.row.${index + 1}`}
                        >
                          <TableCell className="font-semibold text-primary">
                            {student.rollNo.toString()}
                          </TableCell>
                          <TableCell className="font-medium text-foreground">
                            {student.name}
                          </TableCell>
                          <TableCell className="text-muted-foreground font-mono text-sm">
                            {student.grNo || "—"}
                          </TableCell>
                          <TableCell className="text-muted-foreground font-mono text-sm">
                            {student.penNo || "—"}
                          </TableCell>
                          <TableCell className="text-muted-foreground font-mono text-sm">
                            {student.apaarNo || "—"}
                          </TableCell>
                          <TableCell className="text-muted-foreground font-mono text-sm">
                            {student.udiseCode || "—"}
                          </TableCell>
                          <TableCell className="text-muted-foreground font-mono text-sm">
                            {student.aadharNo || "—"}
                          </TableCell>
                          <TableCell className="text-muted-foreground font-mono text-sm">
                            {student.col1 || "—"}
                          </TableCell>
                          <TableCell className="text-muted-foreground font-mono text-sm">
                            {student.col2 || "—"}
                          </TableCell>
                          <TableCell className="text-muted-foreground font-mono text-sm">
                            {student.col3 || "—"}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              {/* Edit button */}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-primary hover:text-primary hover:bg-primary/10 rounded-lg h-8 w-8 p-0"
                                onClick={() => openEditDialog(student)}
                                data-ocid={`student.edit_button.${index + 1}`}
                              >
                                <Pencil className="w-4 h-4" />
                                <span className="sr-only">સંપાદિત કરો</span>
                              </Button>

                              {/* Delete button */}
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-lg h-8 w-8 p-0"
                                    data-ocid={`student.delete_button.${index + 1}`}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    <span className="sr-only">કાઢી નાખો</span>
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent data-ocid="student.dialog">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle className="font-display">
                                      વિદ્યાર્થી કાઢી નાખવો?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      <strong>{student.name}</strong> (Roll No.{" "}
                                      {student.rollNo.toString()}) ની માહિતી
                                      કાઢી નાખવામાં આવશે. આ ક્રિયા પૂર્વવત્ કરી શકાતી
                                      નથી.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel data-ocid="student.cancel_button">
                                      રદ કરો
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDelete(student.id)}
                                      className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                                      data-ocid="student.confirm_button"
                                    >
                                      {deleteMutation.isPending ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                      ) : null}
                                      કાઢી નાખો
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </motion.tr>
                      ))
                    )}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>
          )}
        </motion.section>
      </main>

      {/* Edit Student Dialog */}
      <Dialog
        open={!!editingStudent}
        onOpenChange={(open) => {
          if (!open) closeEditDialog();
        }}
      >
        <DialogContent
          className="max-w-2xl max-h-[90vh] overflow-y-auto"
          data-ocid="student.edit_modal"
        >
          <DialogHeader>
            <DialogTitle className="font-display text-lg font-semibold">
              વિદ્યાર્થી માહિતી સંપાદિત કરો
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 py-2">
            {/* Roll No */}
            <div className="col-span-1 space-y-1.5">
              <Label htmlFor="edit-rollNo" className="font-medium text-sm">
                Roll No. <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-rollNo"
                type="number"
                placeholder="જેમ કે 1"
                value={editForm.rollNo}
                onChange={(e) => handleEditChange("rollNo", e.target.value)}
                className={editErrors.rollNo ? "border-destructive" : ""}
                data-ocid="student.edit_rollno.input"
                min={1}
              />
              {editErrors.rollNo && (
                <p
                  className="text-destructive text-xs"
                  data-ocid="student.edit_rollno.error_state"
                >
                  {editErrors.rollNo}
                </p>
              )}
            </div>

            {/* Student Name */}
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="edit-name" className="font-medium text-sm">
                વિદ્યાર્થીનું નામ <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-name"
                type="text"
                placeholder="પૂરું નામ લખો"
                value={editForm.name}
                onChange={(e) => handleEditChange("name", e.target.value)}
                className={editErrors.name ? "border-destructive" : ""}
                data-ocid="student.edit_name.input"
              />
              {editErrors.name && (
                <p
                  className="text-destructive text-xs"
                  data-ocid="student.edit_name.error_state"
                >
                  {editErrors.name}
                </p>
              )}
            </div>

            {/* G.R. No */}
            <div className="col-span-1 space-y-1.5">
              <Label htmlFor="edit-grNo" className="font-medium text-sm">
                G.R. No. <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-grNo"
                type="text"
                placeholder="GR નંબર"
                value={editForm.grNo}
                onChange={(e) => handleEditChange("grNo", e.target.value)}
                className={editErrors.grNo ? "border-destructive" : ""}
                data-ocid="student.edit_grno.input"
              />
              {editErrors.grNo && (
                <p
                  className="text-destructive text-xs"
                  data-ocid="student.edit_grno.error_state"
                >
                  {editErrors.grNo}
                </p>
              )}
            </div>

            {/* PEN No */}
            <div className="col-span-1 space-y-1.5">
              <Label htmlFor="edit-penNo" className="font-medium text-sm">
                PEN No.
              </Label>
              <Input
                id="edit-penNo"
                type="text"
                placeholder="PEN નંબર"
                value={editForm.penNo}
                onChange={(e) => handleEditChange("penNo", e.target.value)}
                data-ocid="student.edit_penno.input"
              />
            </div>

            {/* APAAR No */}
            <div className="col-span-1 space-y-1.5">
              <Label htmlFor="edit-apaarNo" className="font-medium text-sm">
                APAAR No.
              </Label>
              <Input
                id="edit-apaarNo"
                type="text"
                placeholder="APAAR નંબર"
                value={editForm.apaarNo}
                onChange={(e) => handleEditChange("apaarNo", e.target.value)}
                data-ocid="student.edit_apaarno.input"
              />
            </div>

            {/* UDISE Code */}
            <div className="col-span-1 space-y-1.5">
              <Label htmlFor="edit-udiseCode" className="font-medium text-sm">
                UDISE Code
              </Label>
              <Input
                id="edit-udiseCode"
                type="text"
                placeholder="UDISE કોડ"
                value={editForm.udiseCode}
                onChange={(e) => handleEditChange("udiseCode", e.target.value)}
                data-ocid="student.edit_udise.input"
              />
            </div>

            {/* Aadhar No */}
            <div className="col-span-1 space-y-1.5">
              <Label htmlFor="edit-aadharNo" className="font-medium text-sm">
                Aadhar No.
              </Label>
              <Input
                id="edit-aadharNo"
                type="text"
                placeholder="આધાર નંબર"
                value={editForm.aadharNo}
                onChange={(e) => handleEditChange("aadharNo", e.target.value)}
                data-ocid="student.edit_aadhar.input"
                maxLength={12}
              />
            </div>

            {/* Custom Col 1 */}
            <div className="col-span-1 space-y-1.5">
              <Label htmlFor="edit-col1" className="font-medium text-sm">
                {col1Heading}
              </Label>
              <Input
                id="edit-col1"
                type="text"
                placeholder={col1Heading}
                value={editForm.col1}
                onChange={(e) => handleEditChange("col1", e.target.value)}
                data-ocid="student.edit_col1.input"
              />
            </div>

            {/* Custom Col 2 */}
            <div className="col-span-1 space-y-1.5">
              <Label htmlFor="edit-col2" className="font-medium text-sm">
                {col2Heading}
              </Label>
              <Input
                id="edit-col2"
                type="text"
                placeholder={col2Heading}
                value={editForm.col2}
                onChange={(e) => handleEditChange("col2", e.target.value)}
                data-ocid="student.edit_col2.input"
              />
            </div>

            {/* Custom Col 3 */}
            <div className="col-span-1 space-y-1.5">
              <Label htmlFor="edit-col3" className="font-medium text-sm">
                {col3Heading}
              </Label>
              <Input
                id="edit-col3"
                type="text"
                placeholder={col3Heading}
                value={editForm.col3}
                onChange={(e) => handleEditChange("col3", e.target.value)}
                data-ocid="student.edit_col3.input"
              />
            </div>
          </div>

          <DialogFooter className="mt-2 gap-2">
            <Button
              variant="outline"
              onClick={closeEditDialog}
              disabled={updateMutation.isPending}
              data-ocid="student.edit_cancel.button"
            >
              રદ કરો
            </Button>
            <Button
              onClick={handleEditSave}
              disabled={updateMutation.isPending}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              data-ocid="student.edit_save.button"
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  અપડેટ થઈ રહ્યું છે...
                </>
              ) : (
                "ફેરફાર સેવ કરો"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="border-t border-border mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
          <p>
            © {currentYear}. Built with ❤️ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline font-medium"
            >
              caffeine.ai
            </a>
          </p>
          <p className="font-body">વિદ્યાર્થી માહિતી વ્યવસ્થાપન પ્રણાલી</p>
        </div>
      </footer>
    </div>
  );
}

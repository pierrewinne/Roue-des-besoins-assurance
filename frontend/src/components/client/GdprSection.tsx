import Button from '../ui/Button.tsx'

interface GdprSectionProps {
  rgpdError: string | null
  showDeleteConfirm: boolean
  isDeleting: boolean
  onExportData: () => void
  onDeleteClick: () => void
  onDeleteConfirm: () => void
  onDeleteCancel: () => void
}

export default function GdprSection({
  rgpdError,
  showDeleteConfirm,
  isDeleting,
  onExportData,
  onDeleteClick,
  onDeleteConfirm,
  onDeleteCancel,
}: GdprSectionProps) {
  return (
    <div className="mt-10 pt-6 border-t border-grey-100">
      {rgpdError && (
        <div className="mb-4 p-3 bg-danger-light text-danger text-sm rounded-lg ring-1 ring-danger/10">
          {rgpdError}
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-grey-400">Vos données personnelles</h3>
          <p className="text-xs text-grey-300 mt-0.5">Export ou suppression de vos données (RGPD).</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onExportData}>
            Exporter mes données
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-danger border-danger/20 hover:bg-danger-light"
            onClick={onDeleteClick}
          >
            Supprimer mon compte
          </Button>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="mt-4 p-4 bg-danger-light rounded-xl ring-1 ring-danger/10">
          <p className="text-sm text-danger font-bold mb-2">Cette action est irréversible</p>
          <p className="text-xs text-grey-400 mb-4">
            Toutes vos données seront définitivement supprimées : profil, questionnaires, diagnostics et actions recommandées.
          </p>
          <div className="flex gap-2">
            <Button size="sm" className="bg-danger hover:bg-red-400" disabled={isDeleting} onClick={onDeleteConfirm}>
              {isDeleting ? 'Suppression...' : 'Confirmer la suppression'}
            </Button>
            <Button variant="outline" size="sm" onClick={onDeleteCancel}>
              Annuler
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

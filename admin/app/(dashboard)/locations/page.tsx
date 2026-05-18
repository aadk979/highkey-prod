"use client";

import { Fragment, useCallback, useState } from "react";
import { ChevronDown, ChevronRight, Plus } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { ActiveBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { PageLoader } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import {
  EmptyState,
  Table,
  TableBody,
  TableHead,
  TableRow,
  Td,
  Th,
} from "@/components/ui/table";
import { PaginationBar } from "@/components/ui/pagination";
import { locationsApi } from "@/lib/api/locations";
import { formatDate } from "@/lib/utils";
import { usePaginatedFetch } from "@/hooks/use-paginated-fetch";

export default function LocationsPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [instructions, setInstructions] = useState("");
  const [saving, setSaving] = useState(false);

  const fetcher = useCallback(
    (params: { page: number; limit: number }) => locationsApi.list(params),
    [],
  );

  const { data, pagination, setPage, loading, error, reload } =
    usePaginatedFetch(fetcher);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await locationsApi.create({
        name,
        address,
        postalCode: postalCode || undefined,
        instructions: instructions || undefined,
      });
      setModalOpen(false);
      setName("");
      setAddress("");
      setPostalCode("");
      setInstructions("");
      reload();
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(id: string, isActive: boolean) {
    if (isActive) await locationsApi.deactivate(id);
    else await locationsApi.activate(id);
    reload();
  }

  return (
    <AppShell title="Collection locations">
      <Card className="p-0">
        <div className="flex justify-end border-b border-hairline p-4">
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="size-4" />
            Add location
          </Button>
        </div>

        {loading ? (
          <PageLoader />
        ) : error ? (
          <p className="p-6 text-sm text-error">{error}</p>
        ) : data.length === 0 ? (
          <EmptyState
            title="No locations"
            description="Add a collection point."
          />
        ) : (
          <>
            <Table>
              <TableHead>
                <TableRow>
                  <Th className="w-10" />
                  <Th>Name</Th>
                  <Th>Address</Th>
                  <Th>Postal Code</Th>
                  <Th>Status</Th>
                  <Th>Actions</Th>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((loc) => (
                  <Fragment key={loc.id}>
                    <TableRow
                      onClick={() =>
                        setExpandedId(expandedId === loc.id ? null : loc.id)
                      }
                    >
                      <td className="w-10 px-3 py-4 text-ink-subtle">
                        {expandedId === loc.id ? (
                          <ChevronDown className="size-4" />
                        ) : (
                          <ChevronRight className="size-4" />
                        )}
                      </td>
                      <Td className="font-medium text-ink">{loc.name}</Td>
                      <Td>{loc.address}</Td>
                      <Td>{loc.postalCode ?? "—"}</Td>
                      <Td>
                        <ActiveBadge active={loc.isActive} />
                      </Td>
                      <Td>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleActive(loc.id, loc.isActive);
                          }}
                        >
                          {loc.isActive ? "Deactivate" : "Activate"}
                        </Button>
                      </Td>
                    </TableRow>

                    {expandedId === loc.id && (
                      <tr className="border-b border-hairline bg-surface-1">
                        <td colSpan={6} className="px-6 pb-6 pt-3">
                          <div className="grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-3 lg:grid-cols-4">
                            <div>
                              <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wider text-ink-subtle">
                                ID
                              </p>
                              <p className="break-all font-mono text-xs text-ink">
                                {loc.id}
                              </p>
                            </div>
                            <div className="col-span-2 sm:col-span-2 lg:col-span-3">
                              <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wider text-ink-subtle">
                                Instructions
                              </p>
                              <p className="text-sm text-ink">
                                {loc.instructions ?? (
                                  <span className="italic text-ink-muted">
                                    null
                                  </span>
                                )}
                              </p>
                            </div>
                            <div>
                              <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wider text-ink-subtle">
                                Created At
                              </p>
                              <p className="text-sm text-ink">
                                {formatDate(loc.createdAt)}
                              </p>
                            </div>
                            <div>
                              <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wider text-ink-subtle">
                                Updated At
                              </p>
                              <p className="text-sm text-ink">
                                {formatDate(loc.updatedAt)}
                              </p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </TableBody>
            </Table>
            {pagination ? (
              <PaginationBar pagination={pagination} onPageChange={setPage} />
            ) : null}
          </>
        )}
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="New location"
      >
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <Input
            label="Name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Textarea
            label="Address"
            required
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
          <Input
            label="Postal code"
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
          />
          <Textarea
            label="Instructions"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              Create
            </Button>
          </div>
        </form>
      </Modal>
    </AppShell>
  );
}

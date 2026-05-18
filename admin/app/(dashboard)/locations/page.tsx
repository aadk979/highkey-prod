"use client";

import { useCallback, useState } from "react";
import { Plus } from "lucide-react";
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
                  <Th>Name</Th>
                  <Th>Address</Th>
                  <Th>Status</Th>
                  <Th>ID</Th>
                  <Th>Postal Code</Th>
                  <Th>Instructions</Th>
                  <Th>Created</Th>
                  <Th>Updated</Th>
                  <Th>Actions</Th>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((loc) => (
                  <TableRow key={loc.id}>
                    <Td className="font-medium text-ink">{loc.name}</Td>
                    <Td>{loc.address}</Td>
                    <Td>
                      <ActiveBadge active={loc.isActive} />
                    </Td>
                    <Td>
                      <span className="font-mono text-xs" title={loc.id}>
                        {loc.id.slice(0, 8)}&hellip;
                      </span>
                    </Td>
                    <Td>{loc.postalCode ?? "null"}</Td>
                    <Td>
                      <span
                        className="block max-w-[200px] truncate"
                        title={loc.instructions ?? "null"}
                      >
                        {loc.instructions ?? "null"}
                      </span>
                    </Td>
                    <Td>{formatDate(loc.createdAt)}</Td>
                    <Td>{formatDate(loc.updatedAt)}</Td>
                    <Td>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleActive(loc.id, loc.isActive)}
                      >
                        {loc.isActive ? "Deactivate" : "Activate"}
                      </Button>
                    </Td>
                  </TableRow>
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

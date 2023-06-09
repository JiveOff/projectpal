<template>
  <div>
    <Head>
      <Title>ProjectPal - Projet</Title>
    </Head>
  </div>

  <div class="flex justify-content-end -mt-8 mb-6 mr-8 pt-2">
    <Button
      icon="pi pi-arrow-left"
      label="Retour"
      class=""
      size="small"
      @click="$router.back()"
    ></Button>
  </div>

  <div v-if="project && loaded" class="project-layout">
    <div class="py-3 align-items-center formgrid grid">
      <div class="field col-12 md:col-6 pr-5">
        <h2 class="mr-4">Nom du projet</h2>
        <InputText
          id="name"
          v-model="name"
          class="w-10"
          :class="{ 'p-invalid': nameErrorMessage }"
        />
        <small id="text-error" class="p-error">{{
          nameErrorMessage || "&nbsp;"
        }}</small>
      </div>

      <div class="field col-12 md:col-6">
        <h2 class="mr-5">Client</h2>
        <ClientLookup
          v-if="loaded"
          class="mr-6 w-10"
          :client-list="clientList"
          :default-selected="selectedClient"
          @client-selected="setSelectedClient"
        >
        </ClientLookup>
        <ColorPicker v-model="color" />
      </div>
    </div>

    <div class="py-3">
      <h2>Description</h2>
      <TextArea v-model="description" auto-resize rows="5" class="w-full" />
    </div>

    <div class="py-3">
      <small id="text-error" class="p-error">{{
        membersErrorMessage || "&nbsp;"
      }}</small>
      <ProjectsUserTable
        :model-value="members ?? []"
        :users-available="userList"
        @member-added="addMember"
        @member-edited="updateMember"
        @member-deleted="deleteMember"
      ></ProjectsUserTable>
    </div>

    <div class="py-3">
      <h2>Catégories</h2>
      <Chips v-model="stateLabels" class="block" disabled />
    </div>

    <div class="py-3 flex justify-content-between">
      <Button
        icon="pi pi-check"
        label="Valider"
        severity="success"
        @click="tryUpdateThisProject"
      ></Button>

      <Button
        icon="pi pi-trash"
        label="Supprimer"
        severity="danger"
        @click="() => (isDeleteDialogVisible = true)"
      ></Button>
    </div>

    <Dialog
      v-model:visible="isDeleteDialogVisible"
      modal
      header="Attention"
      class="w-5"
      :draggable="false"
    >
      <ProjectsDeleteDialog
        :project-name="project.name"
        @delete="deleteThisProject"
      >
      </ProjectsDeleteDialog>
    </Dialog>

    <Dialog
      v-model:visible="isClientDialogVisible"
      modal
      :draggable="false"
      :closable="false"
      header="Souhaitez-vous créer un nouveau client ?"
    >
      <div class="">
        <div class="flex justify-content-center">
          <Button
            rounded
            outlined
            icon="pi pi-check"
            severity="success"
            class="mr-3"
            @click="confirmCreateClient(true)"
          ></Button>
          <Button
            rounded
            outlined
            icon="pi pi-times"
            severity="danger"
            @click="confirmCreateClient(false)"
          ></Button>
        </div>
      </div>
    </Dialog>
  </div>

  <div v-if="!project && loaded" class="project-layout">
    <h1 style="color: #f83a3a; font-size: x-large">Projet introuvable</h1>
    <p>Id : {{ route.params.id }}</p>
  </div>
</template>

<script setup lang="ts">
import { updateProject } from "~/utils/server";

const auth = useAuth();
const route = useRoute();

// Init variables
const isDeleteDialogVisible = ref(false);
const isClientDialogVisible = ref(false);

const project: Ref<Awaited<ReturnType<typeof getProject>>> = ref();
const allUsers: Ref<Awaited<ReturnType<typeof getUsers>>> = ref();
const allClients: Ref<Awaited<ReturnType<typeof getClients>>> = ref();

const name: Ref<string | undefined> = ref();
const description: Ref<string | undefined> = ref();
const color: Ref<string | undefined> = ref();
const categories: Ref<
  | Exclude<Awaited<ReturnType<typeof getProject>>, undefined>["ticketStates"]
  | undefined
> = ref();
const stateLabels: Ref<Array<string>> = ref([]);
const selectedClient: Ref<string | undefined> = ref();
const members: Ref<
  | Exclude<Awaited<ReturnType<typeof getProject>>, undefined>["members"]
  | undefined
> = ref();
const newMembers: typeof members = ref([]);
const updatedMembers: typeof members = ref([]);
const deletedMembers: typeof members = ref([]);

// Fetch data
const loaded = ref(false);
onMounted(async () => {
  project.value = Number.isInteger(Number(route.params.id))
    ? await getProject(route.params.id as string)
    : undefined;

  if (project.value?.id === undefined) project.value = undefined;

  allUsers.value = await getUsers();
  allClients.value = await getClients();

  name.value = project.value?.name;
  description.value = project.value?.description;
  color.value = project.value?.color;
  categories.value = project.value?.ticketStates;
  stateLabels.value = categories.value?.map((category) => category.name) ?? [];
  selectedClient.value = project.value?.client?.name ?? "";
  members.value = project.value?.members;
  loaded.value = true;
});

// Initialize dropdowns / lookups lists
const clientList = computed(() => {
  return allClients.value?.map((client) => client.name);
});
const userList = ref(allUsers);

// Used by the client lookup to set the selected client
const setSelectedClient = (client: string) => {
  selectedClient.value = client;
};

// Track new members
const addMember = (
  member: Exclude<(typeof members)["value"], undefined>[number]
) => {
  newMembers.value?.push(member);
};

// Tracl members to update
const updateMember = (
  member: Exclude<(typeof members)["value"], undefined>[number]
) => {
  updatedMembers.value?.push(member);
};

// Track members to delete
const deleteMember = (
  member: Exclude<(typeof members)["value"], undefined>[number]
) => {
  deletedMembers.value?.push(member);
};

// Track members to delete

// Form validation
const nameErrorMessage = ref("");
const membersErrorMessage = ref("");

function validateForm() {
  let valid = true;

  if (!name.value) {
    nameErrorMessage.value = "Un nom de projet est requis.";
    valid = false;
  }

  if (!members.value?.find((member) => member.role === "OWNER")) {
    membersErrorMessage.value =
      "Un membre du projet avec le rôle OWNER est requis.";
  }

  if (valid) {
    nameErrorMessage.value = "";
    membersErrorMessage.value = "";
  }

  return valid;
}

// Check if form is valid before creating the project
const tryUpdateThisProject = () => {
  if (!validateForm()) {
    warn("Champs manquants ou invalides.");
    return;
  }

  if (
    selectedClient.value !== "" &&
    clientList.value?.indexOf(selectedClient.value ?? "") == -1
  ) {
    isClientDialogVisible.value = true;
  } else {
    updateThisProject();
  }
};

// In case selectClient does not exist yet, confirm its creation
const confirmCreateClient = (confirm: boolean) => {
  isClientDialogVisible.value = false;

  if (confirm) {
    updateThisProject();
  }
};

// Update project on submit
const updateThisProject = async () => {
  if (!validateForm()) {
    warn("Champs manquants ou invalides.");
    return;
  }

  await updateProject(project.value?.id ?? 0, {
    id: project.value?.id ?? 0,
    name: name.value ?? "",
    description: description.value ?? "",
    color: color.value ?? "",
    client: selectedClient.value ?? "",
    newMembers:
      newMembers.value?.map((member) => ({
        userId: member.user.id,
        role: member.role,
      })) ?? [],
    updateMembers: updatedMembers.value,
    deleteMembers: deletedMembers.value,
  });
  await createLog(
    "a mis à jour #" + String(project.value?.id) + " - " + project.value?.name
  );

  navigateTo(`/projects/${route.params.id}`);
};

// Delete project
const deleteThisProject = async () => {
  isDeleteDialogVisible.value = false;

  if (!project.value?.id) return;

  await deleteProject(project.value?.id);
  await createLog(
    "a supprimé le projet #" +
      String(project.value.id) +
      " - " +
      project.value.name
  );

  navigateTo("/");
};
</script>

<style lang="scss" scoped>
.project-layout {
  margin: 1.5rem;
}
</style>

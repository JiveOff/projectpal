<template>
  <div class="project" :style="styleObject">
    <NuxtLink :to="`/projects/${props.project.id}`">
      <h3>{{ props.project.name }}</h3>
      <p>
        {{ props.project.client?.name ?? "&nbsp;" }}
      </p>

      <div class="flex justify-content-end">
        <AvatarGroup>
          <Avatar
            v-for="member in props.project.members.slice(0, 3)"
            :visible="true"
            :image="member.user.image"
            shape="circle"
          />
          <Avatar
            v-if="plusMember > 0"
            :label="'+' + String(plusMember)"
            shape="circle"
            size="normal"
            style="background-color: '#9c27b0', color: '#ffffff'"
          />
        </AvatarGroup>
      </div>
    </NuxtLink>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps<{
  project: Exclude<
    Awaited<ReturnType<typeof getUser>>,
    undefined
  >["projects"][number]["project"];
}>();

const styleObject = {
  "border-color": "#" + props.project.color,
  "hover-color": "#" + props.project.color,
};

const memberNumber = props.project.members.length;
const plusMember = memberNumber - 3;
</script>

<style lang="scss" scoped>
.project {
  background-color: white;
  height: 10rem;
  width: 18rem;
  border-radius: 5px;
  padding: 0.2rem 1rem;
  margin-top: 1rem;
  border-left: solid 0.5rem;

  &:hover {
    box-shadow: 0 0 5px #1a1919;
    cursor: pointer;
  }

  p {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .users {
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    padding: 0.5rem 0;
    margin-top: 0;

    .user {
      width: 2rem;
      height: 2rem;
      border-radius: 50%;
      margin-left: 0.5rem;
    }
  }
}
a:link {
  text-decoration: none;
  color: black;
}

a:visited {
  text-decoration: none;
  color: black;
}

a:hover {
  text-decoration: none;
}

a:active {
  text-decoration: none;
}
</style>

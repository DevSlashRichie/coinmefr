/* eslint-disable camelcase -- yes */
import type { Client as _Client } from "./client";
import { BaseAction } from "./client";
import { useClient as _useClient } from "./context";
import { boolean, z } from "zod";

export interface Institution {
  id: string;
  display_name: string;
}

export const CreateInstitution = z.object({
  display_name: z.string({
    message: "El nombre de la institución es requerido",
  }),
});

export type CreateInstitutionType = z.infer<typeof CreateInstitution>;

export interface InstitutionClass {
  id: string;
  display_name: string;
}
export interface OpenChat {
  counterparty: User;
  last_message: Chat;
  unread_messages: number;
}

export interface ClassMember {
  game_profile?: UserGameProfile;
  user: User;
}

export const CreateInstitutionClass = z.object({
  institution_id: z.string(),
  display_name: z.string(),
});

export type CreateInstitutionClassType = z.infer<typeof CreateInstitutionClass>;

export const CreateTeam = z.object({
  display_name: z.string(),
  class_id: z.string(),
  logo: z.string(),
  members: z.array(z.string()).default([]),
});

export const UpdateTeam = z.object({
  display_name: z.string().optional(),
  logo: z.string().optional(),
});

export const CreateBoss = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  questions: z
    .array(
      z.object({
        question: z.string().min(1),
        damage: z.coerce.number().min(1).default(1),
      }),
    )
    .min(1)
    .default([]),
  crit: z.boolean().default(false),
  image_url: z.string().min(1),
  total_hp: z.coerce.number().min(1),
});

export const UpdateBoss = CreateBoss.omit({
  questions: true,
}).partial();

export type CreateTeamType = z.infer<typeof CreateTeam>;
export type UpdateTeamType = z.infer<typeof UpdateTeam>;

export type CreateBossType = z.infer<typeof CreateBoss>;
export type UpdateBossType = z.infer<typeof UpdateBoss>;

export interface User {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
}

export interface UserSession {
  user: User;
  userType: "teacher" | "student";
}

export interface Boss {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  image_url: string;
  crit: boolean;
  total_hp: number;

  questions?: BossQuestion[];
}

export interface BossQuestion {
  id: string;
  boss_id: string;
  question: string;
  damage: number;
  created_at: string;
  updated_at: string;
}

export interface Chat {
  id: string;
  sender_id: string;
  receiver_id: string;
  read_at: string | null;
  deleted: boolean;
  message: string;
  created_at: string;
  updated_at: string;
}

export const UpdateUserGameProfile = z.object({
  hp: z.number().min(0).optional(),
  level: z.never().optional(),
  xp: z.number().min(0).optional(),
  gold: z.number().min(0).optional(),
  mana: z.number().min(0).optional(),
  character: z.string().optional(),
});

export const UpdateBulkUserGameProfile = z.object({
  users: z.array(z.string()),
  hp: z.number().optional(),
  xp: z.number().optional(),
  gold: z.number().optional(),
  mana: z.number().optional(),
});

export type UpdateBulkUserGameProfileType = z.infer<
  typeof UpdateBulkUserGameProfile
>;

export type UpdateUserGameProfileType = z.infer<typeof UpdateUserGameProfile>;

export interface UserGameProfile {
  id: string;
  user_id: string;
  character: "elf" | "dwarf" | "mage" | "human";
  hp: number;
  level: number;
  xp: number;
  gold: number;
  mana: number;
}

export interface TeamMember {
  id: string;
  class_team_id: string;
  user_id: string;
  user: User;
  game_profile?: UserGameProfile;
}

export interface Team {
  id: string;
  display_name: string;
  logo: string;
  members: TeamMember[];
}

export interface CreatedTeam {
  id: string;
  display_name: string;
  logo: string;
  members: Omit<TeamMember, "user">[];
}

export interface FileMetadata {
  id: string;
  name: string;
  path: string;
  mime_type: string;
}

export interface PowerEffect {
  id: string;
  power_id: string;
  effect_type: "hp" | "mana" | "xp" | "gold";
  target: string;
  value: number;
  created_at: string;
  updated_at: string;
}

export interface Power {
  id: string;
  name: string;
  description: string;
  mana_cost: number;
  user_character_id?: string | null;
  class_id: string;
  created_at: string;
  updated_at: string;
  image: string;
  requires_approval: boolean;
  can_block_an_attack: boolean;
  level_required: number;

  effects?: PowerEffect[];
}

export interface PowerApproval {
  id: string;
  power_id: string;
  user_id: string;
  class_id: string;
  created_at: string;
  updated_at: string;

  user: User;
  power: Power;
  class: InstitutionClass;
}

export const CreatePowerEffect = z.object({
  effect: z.enum(["hp", "mana", "xp", "gold"]),
  target: z.enum(["caster", "target"]),
  value: z.coerce.number().refine((val) => val !== 0, {
    message: "El valor no puede ser 0",
  }),
});

export const EditPowerEffect = CreatePowerEffect.merge(
  z.object({
    id: z.string(),
  }),
);

export const CreatePower = z.object({
  name: z.string(),
  description: z.string(),
  mana_cost: z.coerce.number(),
  user_character_id: z.string().optional(),
  image: z.string(),
  can_block_an_attack: z.boolean().default(false),
  requires_approval: z.boolean().default(false),
  level_required: z.coerce.number().min(1).default(1),
  effects: z.array(CreatePowerEffect).default([]),
});

export const EditPower = CreatePower.partial()
  .omit({
    effects: true,
  })
  .merge(
    z.object({
      effects: z.array(EditPowerEffect).default([]),
    }),
  );

export type CreatePowerType = z.infer<typeof CreatePower>;

export type EditPowerType = z.infer<typeof EditPower>;

export const LoginCheck = z.object({
  username: z
    .string({
      message: "El nombre de usuario es requerido",
    })
    .min(1),
  password: z
    .string({
      message: "La contraseña es requerida",
    })
    .min(1),
  institution_id: z.string({
    message: "La institución es requerida",
  }),
});

export const CreateUser = z.object({
  username: z
    .string({
      message: "El nombre de usuario es requerido",
    })
    .min(1),
  password: z
    .string({
      message: "La contraseña es requerida",
    })
    .min(1),
  first_name: z
    .string({
      message: "El nombre es requerido",
    })
    .min(1),
  last_name: z
    .string({
      message: "El apellido es requerido",
    })
    .min(1),
  is_teacher: z
    .preprocess((val) => {
      if (typeof val === "string") {
        return val === "true";
      }
      return Boolean(val);
    }, z.boolean())
    .default(false),
  class_id: z.string().optional(),
});

export const UpdateUser = CreateUser.omit({
  is_teacher: true,
  class_id: true,
}).partial();

export type CreateUserType = z.infer<typeof CreateUser>;
export type UpdateUserType = z.infer<typeof UpdateUser>;

export const CreateRootUser = z.object({
  user: CreateUser,
  institution: CreateInstitution,
  token: z
    .string({
      message: "El token es requerido",
    })
    .startsWith("token_"),
});

export type CreateRootUserType = z.infer<typeof CreateRootUser>;

export type LoginCheckType = z.infer<typeof LoginCheck>;

export interface Event {
  id: string;
  name: string;
  description: string;
  class_id: string;
  created_at: string;
  updated_at: string;

  effects?: {
    id: string;
    event_id: string;
    target: string;
    target_granular: string;

    xp?: number;
    gold?: number;
    mana?: number;
    health?: number;

    created_at: string;
    updated_at: string;
  }[];
}

export const CreateEvent = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  effects: z
    .array(
      z
        .object({
          target: z.enum(["one_per_each_team", "one_per_class", "everyone"]),
          target_type: z.enum(["any_player", "single_user_type"]),
          value: z.string().optional(),
          xp: z.coerce.number().optional(),
          gold: z.coerce.number().optional(),
          mana: z.coerce.number().optional(),
          health: z.coerce.number().optional(),
        })
        .refine(
          (it) => it.target_type !== "single_user_type" || Boolean(it.value),
          {
            message:
              "El valor es requerido para cuando se require un tipo de usuario único",
          },
        )
        .refine(
          (it) => (it.xp || it.gold || it.mana || it.health) !== undefined,
          {
            message: "Al menos un efecto es requerido (xp, gold, mana, health)",
          },
        )
        .transform((it) => ({
          target: {
            target: it.target,
            granular: {
              type: it.target_type,
              value: it.value,
            },
          },
          xp: it.xp,
          health: it.health,
          mana: it.mana,
          gold: it.gold,
        })),
    )
    .default([]),
});

export const CreateQuest = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  map_coords_x: z.number(),
  map_coords_y: z.number(),
  secondary_map_background: z.string(),
});

export const CreateQuestion = z.object({
  question: z.string().min(1),
  quest_id: z.string().length(36),
  indx: z.number().min(0),
  map_coords: z.tuple([z.number(), z.number()]),
  enabled: z.boolean().default(true),
  answers: z.array(
    z.object({
      value: z.string().min(1).optional(),
      correct: z.boolean(),
    }),
  ),
  game_configuration: z.object({
    gold: z.coerce.number().optional(),
    mana: z.coerce.number().optional(),
    experience: z.coerce.number().optional(),
  }),
  story: z.object({
    title: z.string().min(1),
    content: z.string().min(1),
  }),
});

export const UpdateBossQuestion = z
  .object({
    question: z.string().min(1),
    damage: z.coerce.number().min(1).optional(),
  })
  .partial();

export const CreateReply = z.object({
  answer_value: z.string().min(1),
});

export const CreateReplyState = z.object({
  content: z.string().min(1),
  correct: z.boolean(),
});

export type UpdateBossQuestionType = z.infer<typeof UpdateBossQuestion>;

export type CreateReplyStateType = z.infer<typeof CreateReplyState>;

export type CreateReplyType = z.infer<typeof CreateReply>;

export type CreateQuestionType = z.infer<typeof CreateQuestion>;

export type CreateQuestType = z.infer<typeof CreateQuest>;

export const UpdateQuest = CreateQuest.partial();

export type UpdateQuestType = z.infer<typeof UpdateQuest>;

export type CreateEventType = z.infer<typeof CreateEvent>;

export interface Quest {
  id: string;
  title: string;
  description: string | null;
  map_coords_x: number;
  map_coords_y: number;
  secondary_map_background: string;
  created_at: string;
  updated_at: string;
  missions: Mission[];
}

export interface Mission {
  story: Story;
  question: Question;
  link: QuestLink;
  replies: Reply[];
}

export interface Story {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface Question {
  id: string;
  value: string;
  archived_at: boolean;
  created_at: string;
  updated_at: string;
  answers: Answer[];
}

export interface Answer {
  id: string;
  value: string | null;
  question_id: string;
  correct: boolean;
  archived_at: boolean;
  created_at: string;
  updated_at: string;
}

export interface Attendance {
  id: string;
  user_id: string;
  class_id: string;
  state: boolean;
  date: string;
  created_at: string;
  updated_at: string;
}

export interface QuestLink {
  id: string;
  quest_id: string;
  question_id: string;
  story_id: string;
  indx: number;
  map_coords_x: number;
  map_coords_y: number;
  created_at: string;
  updated_at: string;
}

export interface ReplyState {
  id: string;
  reply_id: string;
  content: string;
  correct: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface Reply {
  id: string;
  quest_link_id: string;
  answer_type: "open" | "multiple_choice";
  answer_value: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  state: ReplyState | null;
}

export type CanProtectInBossResponse =
  | {
      type: "can_protect";
      data: {
        user: User;
        powers: Power[];
        game_profile: UserGameProfile;
      }[];
    }
  | {
      type: "cannot_protect";
      data: {
        type: "cannot_protect";
        data: string;
      };
    };

export class Client {
  constructor(private readonly client: _Client) {}

  get classes() {
    return new (class extends BaseAction {
      create(data: CreateInstitutionClassType) {
        const { operation } = this.client.prepare<InstitutionClass>(
          this.endpoint,
          "POST",
          {
            institution_id: data.institution_id,
            display_name: data.display_name,
          },
        );

        return operation;
      }

      all() {
        const { operation } = this.client.prepare<InstitutionClass[]>(
          this.endpoint,
          "GET",
        );

        return operation;
      }

      me() {
        const { operation } = this.client.prepare<InstitutionClass[]>(
          `${this.endpoint}/me`,
          "GET",
        );

        return operation;
      }

      get_class_member(class_id: string, member_id: string) {
        const { operation } = this.client.prepare<ClassMember>(
          `${this.endpoint}/:class_id/member/:member_id`,
          "GET",
          undefined,
          { class_id, member_id },
        );

        return operation;
      }

      add_student(class_id: string, user_id: string) {
        const { operation } = this.client.prepare<{
          id: string;
          class_id: string;
          user_id: string;
        }>(
          `${this.endpoint}/:class_id/member/student`,
          "PUT",
          { user_id },
          {
            class_id,
          },
        );

        return operation;
      }

      get_all_students(class_id: string) {
        const { operation } = this.client.prepare<
          (User & {
            game_profile: UserGameProfile;
          })[]
        >(`${this.endpoint}/:class_id/member/student`, "GET", undefined, {
          class_id,
        });

        return operation;
      }

      get_all_teachers(class_id: string) {
        const { operation } = this.client.prepare<User[]>(
          `${this.endpoint}/:class_id/member/teacher`,
          "GET",
          undefined,
          {
            class_id,
          },
        );

        return operation;
      }

      set_attendance(
        class_id: string,
        data: {
          user_id: string;
          present: boolean;
          date: string;
        },
      ) {
        const { operation } = this.client.prepare<Attendance>(
          `${this.endpoint}/:class_id/assistency`,
          "POST",
          data,
          { class_id },
        );

        return operation;
      }

      get_attendance(class_id: string, user_id: string, date: string) {
        const { operation } = this.client.prepare<Attendance>(
          `${this.endpoint}/:class_id/assistency/:user_id/date/:date`,
          "GET",
          undefined,
          { class_id, user_id, date },
        );

        return operation;
      }

      get_all_attendance(class_id: string, date: string) {
        const { operation } = this.client.prepare<Attendance[]>(
          `${this.endpoint}/:class_id/assistency/all/date/:date`,
          "GET",
          undefined,
          { class_id, date },
        );

        return operation;
      }
    })(this.client, "/institution/class");
  }

  get game_tools() {
    return new (class extends BaseAction {
      can_protect_in_boss(class_id: string, user_id: string, damage: number) {
        const { operation } = this.client.prepare<CanProtectInBossResponse>(
          `${this.endpoint}/can_protect_in_boss`,
          "GET",
          { user_id, damage },
          { class_id },
        );

        return operation;
      }
    })(this.client, "/institution/class/:class_id/game_tool");
  }

  get powers() {
    return new (class extends BaseAction {
      get_powers(class_id: string) {
        const { operation } = this.client.prepare<Power[]>(
          this.endpoint,
          "GET",
          undefined,
          { class_id },
        );

        return operation;
      }

      create_power(class_id: string, data: CreatePowerType) {
        const { operation } = this.client.prepare<Power>(
          this.endpoint,
          "POST",
          data,
          {
            class_id,
          },
        );

        return operation;
      }

      update_power(class_id: string, power_id: string, data: EditPowerType) {
        const { operation } = this.client.prepare<Power>(
          `${this.endpoint}/:power_id`,
          "POST",
          data,
          { class_id, power_id },
        );

        return operation;
      }

      apply_power(
        class_id: string,
        power_id: string,
        data: { user_id: string; target_id?: string },
      ) {
        const { operation } = this.client.prepare(
          `${this.endpoint}/:power_id/apply`,
          "POST",
          data,
          { class_id, power_id },
        );

        return operation;
      }

      get_pending_approval() {
        const { operation } = this.client.prepare<PowerApproval[]>(
          `${this.endpoint}/approvals`,
          "GET",
        );

        return operation;
      }

      approve_power(class_id: string, approval_id: string, confirm: boolean) {
        const { operation } = this.client.prepare<PowerApproval>(
          `${this.endpoint}/approvals/:approval_id`,
          "DELETE",
          {
            confirm,
          },
          { approval_id, class_id },
        );

        return operation;
      }
    })(this.client, "/institution/class/:class_id/power");
  }

  // quests won't require to pass class_id because it is inherited from the header
  get quests() {
    return new (class extends BaseAction {
      create_quest(data: CreateQuestType) {
        const { operation } = this.client.prepare<Quest>(
          this.endpoint,
          "POST",
          data,
        );

        return operation;
      }

      update_quest(quest_id: string, data: UpdateQuestType) {
        const { operation } = this.client.prepare<Quest>(
          `${this.endpoint}/:quest_id`,
          "PATCH",
          data,
          { quest_id },
        );

        return operation;
      }

      get_quests(classId: string) {
        const { operation } = this.client.prepare<Quest[]>(
          this.endpoint,
          "GET",
          undefined,
          undefined,
          {
            headers: {
              "Class-Id": classId,
            },
          },
        );

        return operation;
      }

      get_quest(
        quest_id: string,
        activeClass: string,
        query?: {
          user_id?: string;
        },
      ) {
        const { operation } = this.client.prepare<Quest>(
          `${this.endpoint}/:quest_id`,
          "GET",
          query,
          { quest_id },
          {
            headers: {
              "Class-Id": activeClass,
            },
          },
        );

        return operation;
      }

      get_mission(quest_id: string, mission_id: string) {
        const { operation } = this.client.prepare<Mission>(
          `${this.endpoint}/:quest_id/mission/:mission_id`,
          "GET",
          undefined,
          { quest_id, mission_id },
        );

        return operation;
      }

      get mission() {
        return new (class extends BaseAction {
          get(quest_id: string, mission_id: string) {
            const { operation } = this.client.prepare<Mission>(
              this.endpoint,
              "GET",
              undefined,
              { quest_id, mission_id },
            );

            return operation;
          }

          update(
            quest_id: string,
            mission_id: string,
            data: Partial<CreateQuestType>,
          ) {
            const { operation } = this.client.prepare<Mission>(
              `${this.endpoint}/:mission_id`,
              "PATCH",
              data,
              { quest_id, mission_id },
            );

            return operation;
          }
        })(this.client, "/institution/quest/:quest_id/mission");
      }

      get reply() {
        return new (class extends BaseAction {
          me(quest_id: string, mission_id: string) {
            const { operation } = this.client.prepare<Reply[]>(
              `${this.endpoint}/me`,
              "GET",
              undefined,
              { quest_id, mission_id },
            );

            return operation;
          }

          create_reply(
            params: { quest_id: string; mission_id: string },
            data: CreateReplyType,
          ) {
            const { operation } = this.client.prepare<Reply>(
              this.endpoint,
              "POST",
              data,
              params,
            );

            return operation;
          }

          update_reply(
            quest_id: string,
            mission_id: string,
            reply_id: string,
            data: CreateReplyType,
          ) {
            const { operation } = this.client.prepare<Reply>(
              `${this.endpoint}/:reply_id`,
              "PATCH",
              data,
              { quest_id, mission_id, reply_id },
            );

            return operation;
          }

          get_replies(quest_id: string, mission_id: string, user_id: string) {
            const { operation } = this.client.prepare<Reply[]>(
              this.endpoint,
              "GET",
              { user_id },
              { quest_id, mission_id },
            );

            return operation;
          }

          get state() {
            return new (class extends BaseAction {
              create_state(
                params: {
                  quest_id: string;
                  mission_id: string;
                  reply_id: string;
                },
                data: CreateReplyStateType,
              ) {
                const { operation } = this.client.prepare<ReplyState>(
                  this.endpoint,
                  "POST",
                  data,
                  params,
                );

                return operation;
              }

              update_state(
                params: {
                  quest_id: string;
                  mission_id: string;
                  reply_id: string;
                  state_id: string;
                },
                data: Partial<CreateReplyStateType>,
              ) {
                const { operation } = this.client.prepare<ReplyState>(
                  `${this.endpoint}/:state_id`,
                  "PATCH",
                  data,
                  params,
                );

                return operation;
              }
            })(
              this.client,
              "/institution/quest/:quest_id/mission/:mission_id/reply/:reply_id/state",
            );
          }
        })(
          this.client,
          "/institution/quest/:quest_id/mission/:mission_id/reply",
        );
      }
    })(this.client, "/institution/quest");
  }

  get question() {
    return new (class extends BaseAction {
      create_question(data: CreateQuestionType) {
        const { operation } = this.client.prepare<QuestLink>(
          this.endpoint,
          "POST",
          data,
        );

        return operation;
      }
    })(this.client, "/institution/question");
  }

  get events() {
    return new (class extends BaseAction {
      get_events(class_id: string) {
        const { operation } = this.client.prepare<Event[]>(
          this.endpoint,
          "GET",
          undefined,
          { class_id },
        );

        return operation;
      }

      create_event(class_id: string, data: CreateEventType) {
        const { operation } = this.client.prepare<Event>(
          this.endpoint,
          "POST",
          data,
          {
            class_id,
          },
        );

        return operation;
      }

      get_people(class_id: string, event_id: string) {
        const { operation } = this.client.prepare<User[]>(
          `${this.endpoint}/:event_id/people`,
          "GET",
          undefined,
          {
            class_id,
            event_id,
          },
        );

        return operation;
      }
    })(this.client, "/institution/class/:class_id/event");
  }

  get chats() {
    return new (class extends BaseAction {
      send_all_message(class_id: string, data: { message: string }) {
        const { operation } = this.client.prepare<Chat>(
          `${this.endpoint}/all`,
          "POST",
          data,
          { class_id },
        );

        return operation;
      }
      open_chats() {
        const { operation } = this.client.prepare<OpenChat[]>(
          this.endpoint,
          "GET",
        );
        return operation;
      }

      get_chat(user_id: string, data?: { classId?: string }) {
        const { operation } = this.client.prepare<Chat[]>(
          `${this.endpoint}/:user_id`,
          "GET",
          data,
          { user_id },
        );

        return operation;
      }

      send_message(data: { receiver_id: string; message: string }) {
        const { operation } = this.client.prepare<Chat>(
          this.endpoint,
          "POST",
          data,
        );

        return operation;
      }

      mark_as_read(user_id: string) {
        const { operation } = this.client.prepare(
          `${this.endpoint}/:user_id/read`,
          "POST",
          undefined,
          { user_id },
        );

        return operation;
      }
    })(this.client, "/user/chat");
  }

  get teams() {
    return new (class extends BaseAction {
      create(data: CreateTeamType) {
        const { operation } = this.client.prepare<CreatedTeam>(
          this.endpoint,
          "POST",
          {
            display_name: data.display_name,
            logo: data.logo,
            members: data.members,
          },
          {
            class_id: data.class_id,
          },
        );

        return operation;
      }

      all(class_id: string) {
        const { operation } = this.client.prepare<Team[]>(
          this.endpoint,
          "GET",
          undefined,
          { class_id },
        );

        return operation;
      }

      one(class_id: string, team_id: string) {
        const { operation } = this.client.prepare<Team>(
          `${this.endpoint}/:team_id`,
          "GET",
          undefined,
          { class_id, team_id },
        );

        return operation;
      }

      add_member(class_team_id: string, class_id: string, user_id: string) {
        const { operation } = this.client.prepare<{
          id: string;
          class_team_id: string;
          user_id: string;
        }>(`${this.endpoint}/member`, "POST", {
          user_id,
          class_id,
          class_team_id,
        });

        return operation;
      }

      update(team_id: string, class_id: string, data: UpdateTeamType) {
        const { operation } = this.client.prepare<Team>(
          `${this.endpoint}/:team_id`,
          "PATCH",
          data,
          { team_id, class_id },
        );

        return operation;
      }

      me(class_id: string) {
        const { operation } = this.client.prepare<{
          team: Team;
          members: TeamMember[];
          me: TeamMember;
        }>(`${this.endpoint}/member/me`, "GET", undefined, { class_id });

        return operation;
      }

      find_missing_team(class_id: string) {
        const { operation } = this.client.prepare<
          {
            has_team: boolean;
            student: {
              id: string;
              user_id: string;
              class_id: string;
            };
          }[]
        >(`${this.endpoint}/member/find_missing_team`, "GET", undefined, {
          class_id,
        });

        return operation;
      }
    })(this.client, "/institution/class/:class_id/team");
  }

  get users() {
    return new (class extends BaseAction {
      create_user(data: CreateUserType) {
        const { operation } = this.client.prepare<User>(
          this.endpoint,
          "POST",
          data,
        );

        return operation;
      }

      all() {
        const { operation } = this.client.prepare<
          (User & {
            game_profile?: UserGameProfile;
          })[]
        >(this.endpoint, "GET");
        return operation;
      }

      me() {
        const { operation } = this.client.prepare<
          User & {
            game_profile: UserGameProfile;
          }
        >(`${this.endpoint}/me`, "GET");
        return operation;
      }

      read_token(token: string) {
        const { operation } = this.client.prepare<User>(
          `${this.endpoint}/me`,
          "GET",
          undefined,
          undefined,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        return operation;
      }

      update_user(id: string, data: UpdateUserType) {
        const { operation } = this.client.prepare<User>(
          this.endpoint,
          "PATCH",
          {
            user_id: id,
            ...data,
          },
          { id },
        );

        return operation;
      }
    })(this.client, "/user");
  }

  get game_profiles() {
    return new (class extends BaseAction {
      one(id: string) {
        const { operation } = this.client.prepare<UserGameProfile>(
          `${this.endpoint}/:id`,
          "GET",
          undefined,
          { id },
        );

        return operation;
      }

      update(id: string, data: UpdateUserGameProfileType) {
        const { operation } = this.client.prepare<UserGameProfile>(
          `${this.endpoint}/:id`,
          "PATCH",
          data,
          { id },
        );

        return operation;
      }

      update_bulk(data: UpdateBulkUserGameProfileType) {
        const { operation } = this.client.prepare<never>(
          `${this.endpoint}/bulk`,
          "PATCH",
          data,
        );

        return operation;
      }

      self_set(data: "elf" | "mage" | "dwarf") {
        const { operation } = this.client.prepare<UserGameProfile>(
          `${this.endpoint}/self_set`,
          "PATCH",
          {
            character: data,
          },
        );

        return operation;
      }
    })(this.client, "/user/game_profile");
  }

  get bosses() {
    return new (class extends BaseAction {
      delete(id: string) {
        const { operation } = this.client.prepare<never>(
          `${this.endpoint}/:id`,
          "DELETE",
          undefined,
          { id },
        );

        return operation;
      }

      all() {
        const { operation } = this.client.prepare<Boss[]>(this.endpoint, "GET");
        return operation;
      }

      one(boss_id: string) {
        const { operation } = this.client.prepare<Boss>(
          `${this.endpoint}/:boss_id`,
          "GET",
          undefined,
          { boss_id },
        );

        return operation;
      }

      create(data: CreateBossType) {
        const { operation } = this.client.prepare<Boss>(
          this.endpoint,
          "POST",
          data,
        );

        return operation;
      }

      update_boss(boss_id: string, data: UpdateBossType) {
        const { operation } = this.client.prepare<Boss>(
          `${this.endpoint}/:boss_id`,
          "PATCH",
          data,
          { boss_id },
        );

        return operation;
      }

      update_question(
        boss_id: string,
        question_id: string,
        data: UpdateBossQuestionType,
      ) {
        const { operation } = this.client.prepare<BossQuestion>(
          `${this.endpoint}/:boss_id/question/:question_id`,
          "PATCH",
          data,
          { boss_id, question_id },
        );

        return operation;
      }

      delete_question(boss_id: string, question_id: string) {
        const { operation } = this.client.prepare<never>(
          `${this.endpoint}/:boss_id/question/:question_id`,
          "DELETE",
          undefined,
          { boss_id, question_id },
        );

        return operation;
      }
    })(this.client, "/institution/boss");
  }

  get files() {
    return new (class extends BaseAction {
      upload(file: File) {
        const f = new FormData();
        f.append("file", file);
        const { operation } = this.client.prepare<FileMetadata>(
          this.endpoint,
          "POST",
          f,
        );
        return operation;
      }
    })(this.client, "/file");
  }

  get inst() {
    return new (class extends BaseAction {
      create(data: CreateInstitutionType) {
        const { operation } = this.client.prepare<Institution>(
          this.endpoint,
          "POST",
          {
            display_name: data.display_name,
          },
        );

        return operation;
      }

      me() {
        const { operation } = this.client.prepare<Institution>(
          `${this.endpoint}/me`,
          "GET",
        );

        return operation;
      }

      all() {
        const { operation } = this.client.prepare<Institution[]>(
          this.endpoint,
          "GET",
        );

        return operation;
      }

      get_all_classes(institution_id?: string) {
        const { operation } = this.client.prepare<InstitutionClass[]>(
          `${this.endpoint}/class`,
          "GET",
          {
            institution_id,
          },
        );

        return operation;
      }

      create_class(data: CreateInstitutionClassType) {
        const { operation } = this.client.prepare<InstitutionClass>(
          `${this.endpoint}/class`,
          "POST",
          {
            institution_id: data.institution_id,
            display_name: data.display_name,
          },
        );

        return operation;
      }
    })(this.client, "/institution");
  }

  get auth() {
    return new (class extends BaseAction {
      login(data: LoginCheckType) {
        const { operation } = this.client.prepare<{
          token: string;
          user_type: "teacher" | "student";
        }>(this.endpoint, "POST", data, undefined, {
          route: "auth",
        });

        return operation;
      }

      register(data: CreateRootUserType) {
        const { operation } = this.client.prepare(
          `${this.endpoint}create`,
          "POST",
          data,
          undefined,
          {
            route: "auth",
          },
        );

        return operation;
      }
    })(this.client, "/");
  }

  get setting() {
    return new (class extends BaseAction {
      get(setting_id: string) {
        const { operation } = this.client.prepare<{
          id: string;
          name: string;
          value: string;
        }>(`${this.endpoint}/:id`, "GET", undefined, {
          id: setting_id,
        });
        return operation;
      }

      update<T>(data: { name: string; value: T }) {
        const { operation } = this.client.prepare(this.endpoint, "PATCH", data);
        return operation;
      }
    })(this.client, "/institution/setting");
  }
}

export function useClient(
  scope: "user" | "admin" | "auth" | "public" = "admin",
) {
  const { client: _client, setHeader } = _useClient(scope);
  const client = new Client(_client);

  return { client, setHeader };
}

export function createClientFromClient(client: _Client) {
  const c = new Client(client);
  return c;
}

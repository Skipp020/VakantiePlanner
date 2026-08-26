-- Vervangt het handmatige total_days-veld door een contract (uren/week +
-- structureel gewerkte weekdagen), waaruit de app het aantal vakantiedagen
-- afleidt: 35 dagen voltijds (40 uur, 5 dagen) naar rato.

alter table members
  add column hours_per_week numeric(4,1) not null default 40
    check (hours_per_week > 0 and hours_per_week <= 40),
  add column working_days smallint[] not null default '{1,2,3,4,5}'
    check (
      working_days <@ array[1,2,3,4,5]::smallint[]
      and coalesce(array_length(working_days, 1), 0) > 0
    );

alter table members drop column total_days;

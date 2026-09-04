-- Ежедневный расход: находит первую свободную дату в периоде и вставляет операцию.
create or replace function public.create_daily_expense(
  p_report_id uuid,
  p_amount numeric,
  p_description text,
  p_period_start date,
  p_period_end date
)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  free_date date;
  result jsonb;
begin
  select d.date::date
  from generate_series(p_period_start, p_period_end, interval '1 day') as d(date)
  where not exists (
    select 1
    from public.operations o
    where o.report_id = p_report_id
      and o.type = 'daily'
      and o.date::date = d.date::date
  )
  order by d.date
  limit 1
  into free_date;

  if free_date is null then
    raise exception 'Нет свободных дат в периоде';
  end if;

  insert into public.operations (report_id, user_id, type, amount, description, date)
  values (p_report_id, auth.uid(), 'daily', p_amount, p_description, free_date)
  returning jsonb_build_object(
    'id', id,
    'report_id', report_id,
    'user_id', user_id,
    'type', type,
    'amount', amount,
    'category_id', category_id,
    'description', description,
    'date', date,
    'created_at', created_at,
    'updated_at', updated_at
  ) into result;

  return result;
end;
$$;
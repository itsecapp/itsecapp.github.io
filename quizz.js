Array.prototype.shuffle = function() {
  for (let i = this.length; i > 0; --i)
  {
    let j = Math.floor(Math.random() * i);
    let x = this[i - 1];
    this[i - 1] = this[j];
    this[j] = x;
  }
}

const ANIM_DURATION = 500;

const quizzState = {
  quizz: null,
  nanswers : 0
}

const template = [
  { "question" : "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    "explanation" : "Yeah",
    "answers": 1,
    "choices" : [
      "Curabitur pharetra libero non erat lacinia pharetra.",
      "Quisque bibendum quam ut nisi tempus dictum.",
      "Quisque a purus elementum, porttitor est vitae, facilisis turpis."
    ] },
  { "question" : "Curabitur vulputate velit porttitor nulla congue consectetur.",
    "explanation" : "Yeah",
    "answers": 1,
    "choices" : [
      "Pellentesque ac diam ornare, efficitur dui consectetur, venenatis felis.",
      "Vivamus luctus ligula quis felis viverra, vitae vehicula eros viverra.",
      "Pellentesque ac diam ornare, efficitur dui consectetur, venenatis felis.",
      "In nec nulla blandit magna tincidunt auctor."
    ] },
  { "question" : "Curabitur vulputate velit porttitor nulla congue consectetur.",
    "explanation" : "Yeah",
    "answers": 1,
    "choices" : [
      "Pellentesque ac diam ornare, efficitur dui consectetur, venenatis felis.",
      "Vivamus luctus ligula quis felis viverra, vitae vehicula eros viverra.",
      "In nec nulla blandit magna tincidunt auctor."
    ] }
]

var quizzs = [
  [
    { "question": "Laquelle de ces affirmations est fausse ?",
      "explanation": null,
      "answers": 1,
      "choices": [
        "Un attaquant peut exécuter du code à distance avec une injection sur le SGDB NoSQL.",
        "Un fichier XML fourni par l'utilisateur n'est pas spécialement dangereux.",
        "Un attaquant découvrant une injection SQL peut être en mesure d'écrire des fichiers sur le système."
      ] },
    { "question": "<img src='injection.png' width='100%' alt='Injection'><br>Quelle vulnérabilité est présente dans ce code ?",
      "explanation": null,
      "answers": 1,
      "choices": [ "Header injection.",
                   "Cross-Site Scripting (XSS).",
                   "SQL injection." ] }
  ],
  template,
  [
    { "question": "Quelle action est impossible à effectuer avec une XSS ?",
      "explanation": null,
      "answers": 1,
      "choices": [
        "Injecter du code PHP pour exécuter des commandes sur le serveur",
        "Faire du phishing afin de récupérer le mot de passe",
        "Voler le compte de l'utilisateur grâce à ses cookies"
      ] }
  ],
  template,
  template,
  template,
  template,
  template,
  template,
  template,
  template,
  template
];

function getQuizz(el)
{
  quizzState.quizz = quizzs[parseInt($(this).attr("data-choice")) - 1];
  if (!quizzState.quizz)
    return;
  $("div#winmsg").fadeOut(ANIM_DURATION);
  quizzState.nanswers = 0;

  var generated = '<div class="row">';

  quizzState.quizz.forEach(function(question, index) {
      generated += '<div class="col-md-6">\
                      <h2 class="sc-title">\
                        Question ' + (index + 1) + '<br>\
                        ' + question["question"] + '\
                      </h2>\
                      <ul class="list-group">';

    let choices = question["choices"];
    var genchoices = [];
    question["choices"].forEach(function(choice, index) {
      genchoices.push('<li class="list-group-item" data-active="false"\
                        data-valid="' +
                        (index < quizzState.quizz.answers ? "true" : "false") +
                        '">\
                        ' + choice + '\
                      </li>');
    });
    genchoices.shuffle();

    generated += '    ' + genchoices.join('') + '\
                    </ul>\
                  </div>';
  });

  generated += '</div>';

  $("div#validate").fadeOut(ANIM_DURATION);
  $("div#quizz h1.sc-title").html($(this).children("h2").html());
  $("div#quizz div#questions").html(generated);
  $("div#quizz div#questions ul li").click(clickChoice);
  $("div#quizz").fadeIn(ANIM_DURATION);
  $("html, body").animate({
    scrollTop: $("div#quizz").offset().top
  }, ANIM_DURATION);
}

function getQuestion(li)
{
  let html = $(li).parent().parent().html();
  for (let i = 0; i < quizzState.quizz.length; ++i)
  {
    if (html.indexOf(quizzState.quizz[i].question) != -1)
      return quizzState.quizz[i];
  }
  return null;
}

function setActive(choice, isActive)
{
  $(choice)
    .attr("data-active", (!!isActive).toString())
    .attr("class", "list-group-item");
  if (isActive)
    $(choice).addClass("active")
}

function clickChoice()
{
  if ($(this).attr("data-active") === "true")
  {
    setActive(this, false);
    return;
  }
  let question = getQuestion(this);
  let isCorrect = false;
  for (let i = 0; i < question.answers && !isCorrect; ++i)
  {
    if ($(this).html().indexOf(question.choices[i]) != -1)
      isCorrect = true;
  }

  if ($(this).parent().children("li[data-active=true]").length == 0)
    ++quizzState.nanswers;
  if (quizzState.nanswers === quizzState.quizz.length)
    $("div#validate").fadeIn(ANIM_DURATION);

  setActive(this, true);
}

function validateQuizz(event)
{
  event.stopPropagation();

  var error = false;
  $("div#quizz div#questions ul li[data-active=true]:not(.list-group-item-success)").each(function() {
    $(this).removeClass("active");

    let state = "success";
    if ($(this).attr("data-valid") === "false")
    {
      error = true;
      state = "danger";
    }
    else
    {
      var $parent = $(this).parent();
      var explanation = null;
      quizzState.quizz.forEach(function(question, index) {
        if ($parent.parent().html().indexOf(question["question"]) != -1)
          explanation = question["explanation"];
      });
      if (explanation !== null)
      {
        $("<div class='alert alert-info'>")
          .text(explanation)
          .insertBefore($parent);
      }
      $parent.children().unbind("click");
    }

    $(this).addClass("list-group-item-" + state);
  });
}

$(function() {
  $("div[data-choice]").click(getQuizz);
  $("div#validate button").click(validateQuizz);
  $("button#close").click(function() {
    $("div#winmsg").fadeOut(ANIM_DURATION);
  })
});

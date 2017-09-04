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

const quizzs = [
  [
    {
      "question": "Laquelle de ces affirmations est fausse ?",
      "explanation": "Il est possible d'exécuter du code à distance grâce à un fichier XML malveillant (XML eXternal Entity, ou XXE).",
      "answers": 1,
      "choices": [
        "Un attaquant peut exécuter du code à distance avec une injection sur le SGDB NoSQL.",
        "Un fichier XML fourni par l'utilisateur n'est pas spécialement dangereux.",
        "Un attaquant découvrant une injection SQL peut être en mesure d'écrire des fichiers sur le système."
      ]
    },
    {
      "question": "<img src='injection.png' width='100%' alt='Injection'><br>Quelle vulnérabilité est présente dans ce code ?",
      "explanation": "Il ne s'agit pas d'une XSS car le header Content-Type indique qu'il s'agit d'un fichier texte brut. On peut en revanche injecter des headers lors de l'appel de la fonction header().",
      "answers": 1,
      "choices": [
        "Header injection.",
         "Cross-Site Scripting (XSS).",
         "SQL injection."
       ]
     }
  ],
  [
    {
      "question": "Choose A and B",
      "explanation": "Well done.",
      "answers": 2,
      "choices": [
        "A", "B", "C"
      ]
    }
  ],
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
  let quizzId = /^A([1-9]\d*)<br>/.exec($(this).children("h2").html())[1];
  quizzState.quizz = quizzs[parseInt(quizzId) - 1];
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
      genchoices.push('<li class="list-group-item">\
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

function getQuestion(div)
{
  let match = /^\s*Question ([1-9]\d*)<br>/.exec($(div).children("h2").html());
  if (!match)
  {
    console.error("wat");
    return null;
  }
  let index = parseInt(match[1]);
  if (index > quizzState.quizz.length)
  {
    console.log("uh");
    return null;
  }
  return quizzState.quizz[index - 1];
}

function setActive(choice, isActive)
{
  $(choice)
    .attr("class", "list-group-item");
  if (isActive)
    $(choice).addClass("active");
}

function clickChoice()
{
  let isActive = ($(this).hasClass("active") || $(this).hasClass("list-group-item-danger"));
  $(this).parent().children("li.list-group-item-danger").each(function() {
    setActive(this, false);
  });
  if (isActive)
  {
    setActive(this, false);
    return;
  }

  if ($(this).parent().children("li.active").length == 0)
    ++quizzState.nanswers;
  if (quizzState.nanswers === quizzState.quizz.length)
    $("div#validate").fadeIn(ANIM_DURATION);

  setActive(this, true);
}

function validateQuizz(event)
{
  event.stopPropagation();

  $("div#quizz div#questions div.col-md-6").each(function() {
    var $this = $(this);
    if ($this.hasClass("answered"))
      return;
    var question = getQuestion($this);
    if (question === null)
    {
      console.log("wth");
      return;
    }
    var hasErrors = ($this.find("ul li.list-group-item-danger").length !== 0);

    $this.find("ul li.active").each(function() {
      setActive(this, false);

      var isCorrect = false;
      for (let i = 0; i < question.answers && !isCorrect; ++i)
      {
        if ($(this).html().indexOf(question.choices[i]) != -1)
          isCorrect = true;
      }
      let state = null;
      if (isCorrect)
      {
        state = "success";
        $(this).unbind("click");
      }
      else
      {
        state = "danger";
        hasErrors = true;
      }
      $(this).addClass("list-group-item-" + state);
    });

    if (!hasErrors &&
        $this.find("ul li.list-group-item-success").length === question.answers)
    {
      $this.addClass("answered");
      if (question["explanation"] !== null)
      {
        $("<div class='alert alert-info'>")
          .text(question["explanation"])
          .insertBefore($this.find("ul"));
      }
      $this.find("ul li").unbind("click");
    }
  });

  if ($("div#quizz div#questions div.answered").length === quizzState.quizz.length)
  {
    $("div#scroll").fadeIn(ANIM_DURATION);
    $("div#validate").fadeOut(ANIM_DURATION);
  }
}

function scrollTop()
{
  $("html, body").animate({
    scrollTop: $("div#quizzs div.row").offset().top
  }, ANIM_DURATION);
  $("div#scroll").fadeOut(ANIM_DURATION, function() {
    $("div#quizz").fadeOut(ANIM_DURATION);
  });
}

$(function() {
  $("div.choice").click(getQuizz);
  $("div#validate button").click(validateQuizz);
  $("div#scroll button").click(scrollTop);
});
